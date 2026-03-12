/**
 * PromptVault local storage engine.
 * Stores vault data in .promptvault/ directory (like .git/ for Git).
 *
 * Structure:
 *   .promptvault/
 *     config.json          - vault configuration
 *     HEAD                 - current branch ref
 *     refs/
 *       heads/             - branch tips (commit hashes)
 *       tags/              - tag refs
 *     objects/
 *       <hash>.json        - commit objects
 *     staging.json         - staged files
 *     prompts/
 *       <name>.prompt      - latest prompt content per branch
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { diffLines } from "diff";

// ── Types ──────────────────────────────────────────────────────────────

export interface VaultConfig {
  author?: string;
  email?: string;
  defaultModel?: string;
  remotes?: Record<string, string>;
  createdAt: string;
}

export interface StagedFile {
  name: string;
  filePath: string;
  content: string;
  stagedAt: string;
}

export interface CommitObject {
  hash: string;
  parent: string | null;
  branch: string;
  message: string;
  author: string;
  timestamp: string;
  files: Record<string, string>; // name → content snapshot
  tags?: string[];
}

export interface PromptFile {
  name: string;
  content: string;
  filePath: string;
  model?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface DiffResult {
  fileName: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  type: "added" | "removed" | "unchanged";
  value: string;
}

export interface MergeConflict {
  fileName: string;
  ours: string;
  theirs: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const VAULT_DIR = ".promptvault";
const OBJECTS_DIR = "objects";
const REFS_DIR = "refs";
const HEADS_DIR = "heads";
const TAGS_DIR = "tags";
const PROMPTS_DIR = "prompts";
const CONFIG_FILE = "config.json";
const HEAD_FILE = "HEAD";
const STAGING_FILE = "staging.json";
const IGNORE_FILE = ".pvignore";

const PROMPT_EXTENSIONS = [".prompt", ".md", ".txt", ".yaml", ".yml", ".json"];

// ── Storage Class ──────────────────────────────────────────────────────

export class VaultStorage {
  private root: string;
  private vaultPath: string;

  constructor(root?: string) {
    this.root = root || this.findVaultRoot(process.cwd());
    this.vaultPath = path.join(this.root, VAULT_DIR);
  }

  // ── Initialization ─────────────────────────────────────────────────

  private findVaultRoot(dir: string): string {
    let current = dir;
    while (current !== path.dirname(current)) {
      if (fs.existsSync(path.join(current, VAULT_DIR))) {
        return current;
      }
      current = path.dirname(current);
    }
    return dir; // fallback to cwd
  }

  isInitialized(): boolean {
    return fs.existsSync(this.vaultPath);
  }

  assertInitialized(): void {
    if (!this.isInitialized()) {
      throw new Error(
        "Not a prompt vault. Run 'pv init' to initialize one."
      );
    }
  }

  init(author?: string, email?: string): void {
    if (this.isInitialized()) {
      throw new Error("Prompt vault already initialized in this directory.");
    }

    // Create directory structure
    fs.mkdirSync(path.join(this.vaultPath, OBJECTS_DIR), { recursive: true });
    fs.mkdirSync(path.join(this.vaultPath, REFS_DIR, HEADS_DIR), {
      recursive: true,
    });
    fs.mkdirSync(path.join(this.vaultPath, REFS_DIR, TAGS_DIR), {
      recursive: true,
    });
    fs.mkdirSync(path.join(this.vaultPath, PROMPTS_DIR), { recursive: true });

    // Write config
    const config: VaultConfig = {
      author: author || process.env.USER || "unknown",
      email: email || "",
      createdAt: new Date().toISOString(),
      remotes: {},
    };
    this.writeJson(path.join(this.vaultPath, CONFIG_FILE), config);

    // Write HEAD → main
    fs.writeFileSync(path.join(this.vaultPath, HEAD_FILE), "main", "utf-8");

    // Write empty staging
    this.writeJson(path.join(this.vaultPath, STAGING_FILE), []);
  }

  // ── Config ─────────────────────────────────────────────────────────

  getConfig(): VaultConfig {
    this.assertInitialized();
    return this.readJson(path.join(this.vaultPath, CONFIG_FILE));
  }

  setConfig(updates: Partial<VaultConfig>): void {
    this.assertInitialized();
    const config = this.getConfig();
    Object.assign(config, updates);
    this.writeJson(path.join(this.vaultPath, CONFIG_FILE), config);
  }

  // ── HEAD / Branches ────────────────────────────────────────────────

  getCurrentBranch(): string {
    this.assertInitialized();
    return fs.readFileSync(
      path.join(this.vaultPath, HEAD_FILE),
      "utf-8"
    ).trim();
  }

  setCurrentBranch(branch: string): void {
    fs.writeFileSync(path.join(this.vaultPath, HEAD_FILE), branch, "utf-8");
  }

  getBranches(): string[] {
    this.assertInitialized();
    const headsDir = path.join(this.vaultPath, REFS_DIR, HEADS_DIR);
    if (!fs.existsSync(headsDir)) return [];
    return fs.readdirSync(headsDir).sort();
  }

  createBranch(name: string): void {
    this.assertInitialized();
    const branchFile = path.join(
      this.vaultPath, REFS_DIR, HEADS_DIR, name
    );
    if (fs.existsSync(branchFile)) {
      throw new Error(`Branch '${name}' already exists.`);
    }

    // Point new branch at current branch's HEAD commit
    const currentBranch = this.getCurrentBranch();
    const currentHead = this.getBranchHead(currentBranch);
    fs.writeFileSync(branchFile, currentHead || "", "utf-8");
  }

  deleteBranch(name: string): void {
    this.assertInitialized();
    if (name === this.getCurrentBranch()) {
      throw new Error("Cannot delete the current branch.");
    }
    const branchFile = path.join(
      this.vaultPath, REFS_DIR, HEADS_DIR, name
    );
    if (!fs.existsSync(branchFile)) {
      throw new Error(`Branch '${name}' does not exist.`);
    }
    fs.unlinkSync(branchFile);
  }

  getBranchHead(branch: string): string | null {
    const branchFile = path.join(
      this.vaultPath, REFS_DIR, HEADS_DIR, branch
    );
    if (!fs.existsSync(branchFile)) return null;
    const content = fs.readFileSync(branchFile, "utf-8").trim();
    return content || null;
  }

  setBranchHead(branch: string, hash: string): void {
    const branchFile = path.join(
      this.vaultPath, REFS_DIR, HEADS_DIR, branch
    );
    fs.writeFileSync(branchFile, hash, "utf-8");
  }

  switchBranch(name: string): void {
    this.assertInitialized();
    const branchFile = path.join(
      this.vaultPath, REFS_DIR, HEADS_DIR, name
    );
    if (!fs.existsSync(branchFile)) {
      throw new Error(`Branch '${name}' does not exist.`);
    }

    // Check for uncommitted changes
    const staged = this.getStagedFiles();
    if (staged.length > 0) {
      throw new Error(
        "You have staged changes. Commit or reset before switching branches."
      );
    }

    this.setCurrentBranch(name);

    // Restore branch state
    const headHash = this.getBranchHead(name);
    if (headHash) {
      const commit = this.getCommit(headHash);
      if (commit) {
        this.restorePromptFiles(commit.files);
      }
    }
  }

  // ── Staging ────────────────────────────────────────────────────────

  getStagedFiles(): StagedFile[] {
    this.assertInitialized();
    return this.readJson(path.join(this.vaultPath, STAGING_FILE));
  }

  stageFile(filePath: string): StagedFile {
    this.assertInitialized();
    const absPath = path.resolve(filePath);

    if (!fs.existsSync(absPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Check .pvignore
    if (this.isIgnored(absPath)) {
      throw new Error(`File is ignored by ${IGNORE_FILE}: ${filePath}`);
    }

    const content = fs.readFileSync(absPath, "utf-8");
    const name = this.extractPromptName(absPath);

    const staged = this.getStagedFiles();

    // Replace if already staged
    const existing = staged.findIndex((s) => s.name === name);
    const entry: StagedFile = {
      name,
      filePath: path.relative(this.root, absPath),
      content,
      stagedAt: new Date().toISOString(),
    };

    if (existing >= 0) {
      staged[existing] = entry;
    } else {
      staged.push(entry);
    }

    this.writeJson(path.join(this.vaultPath, STAGING_FILE), staged);
    return entry;
  }

  unstageFile(name: string): void {
    this.assertInitialized();
    const staged = this.getStagedFiles();
    const filtered = staged.filter((s) => s.name !== name);
    if (filtered.length === staged.length) {
      throw new Error(`'${name}' is not staged.`);
    }
    this.writeJson(path.join(this.vaultPath, STAGING_FILE), filtered);
  }

  clearStaging(): void {
    this.assertInitialized();
    this.writeJson(path.join(this.vaultPath, STAGING_FILE), []);
  }

  // ── Commits ────────────────────────────────────────────────────────

  commit(message: string): CommitObject {
    this.assertInitialized();
    const staged = this.getStagedFiles();
    if (staged.length === 0) {
      throw new Error("Nothing to commit. Stage files with 'pv add <file>'.");
    }

    const config = this.getConfig();
    const branch = this.getCurrentBranch();
    const parent = this.getBranchHead(branch);

    // Build files snapshot: start from parent, overlay staged
    let files: Record<string, string> = {};
    if (parent) {
      const parentCommit = this.getCommit(parent);
      if (parentCommit) {
        files = { ...parentCommit.files };
      }
    }

    for (const sf of staged) {
      files[sf.name] = sf.content;
    }

    const commitData: Omit<CommitObject, "hash"> = {
      parent,
      branch,
      message,
      author: config.author || "unknown",
      timestamp: new Date().toISOString(),
      files,
    };

    // Generate hash
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(commitData))
      .digest("hex")
      .slice(0, 12);

    const commit: CommitObject = { hash, ...commitData };

    // Write object
    this.writeJson(
      path.join(this.vaultPath, OBJECTS_DIR, `${hash}.json`),
      commit
    );

    // Update branch head
    this.setBranchHead(branch, hash);

    // Save prompt files
    for (const [name, content] of Object.entries(files)) {
      const promptFile = path.join(
        this.vaultPath, PROMPTS_DIR, `${name}.prompt`
      );
      fs.writeFileSync(promptFile, content, "utf-8");
    }

    // Clear staging
    this.clearStaging();

    return commit;
  }

  getCommit(hash: string): CommitObject | null {
    const objPath = path.join(this.vaultPath, OBJECTS_DIR, `${hash}.json`);
    if (!fs.existsSync(objPath)) return null;
    return this.readJson(objPath);
  }

  getLog(branch?: string): CommitObject[] {
    this.assertInitialized();
    const b = branch || this.getCurrentBranch();
    const head = this.getBranchHead(b);
    if (!head) return [];

    const commits: CommitObject[] = [];
    let current: string | null = head;

    while (current) {
      const commit = this.getCommit(current);
      if (!commit) break;
      commits.push(commit);
      current = commit.parent;
    }

    return commits;
  }

  // ── Tags ───────────────────────────────────────────────────────────

  createTag(name: string, hash?: string): void {
    this.assertInitialized();
    const tagFile = path.join(this.vaultPath, REFS_DIR, TAGS_DIR, name);
    if (fs.existsSync(tagFile)) {
      throw new Error(`Tag '${name}' already exists.`);
    }

    const target =
      hash || this.getBranchHead(this.getCurrentBranch());
    if (!target) {
      throw new Error("No commits to tag. Make a commit first.");
    }

    fs.writeFileSync(tagFile, target, "utf-8");
  }

  getTags(): Array<{ name: string; hash: string }> {
    this.assertInitialized();
    const tagsDir = path.join(this.vaultPath, REFS_DIR, TAGS_DIR);
    if (!fs.existsSync(tagsDir)) return [];

    return fs.readdirSync(tagsDir).map((name) => ({
      name,
      hash: fs.readFileSync(path.join(tagsDir, name), "utf-8").trim(),
    }));
  }

  deleteTag(name: string): void {
    this.assertInitialized();
    const tagFile = path.join(this.vaultPath, REFS_DIR, TAGS_DIR, name);
    if (!fs.existsSync(tagFile)) {
      throw new Error(`Tag '${name}' does not exist.`);
    }
    fs.unlinkSync(tagFile);
  }

  // ── Diff ───────────────────────────────────────────────────────────

  diff(hash1?: string, hash2?: string): DiffResult[] {
    this.assertInitialized();
    const branch = this.getCurrentBranch();

    // Default: compare staged vs last commit
    if (!hash1 && !hash2) {
      const head = this.getBranchHead(branch);
      const staged = this.getStagedFiles();

      if (staged.length === 0 && !head) {
        return [];
      }

      const results: DiffResult[] = [];
      const headCommit = head ? this.getCommit(head) : null;
      const headFiles = headCommit?.files || {};

      // Diff staged files against head
      for (const sf of staged) {
        const oldContent = headFiles[sf.name] || "";
        results.push(this.computeDiff(sf.name, oldContent, sf.content));
      }

      // Also check working directory files for modifications
      const trackedFiles = this.getTrackedFiles();
      for (const tf of trackedFiles) {
        if (staged.some((s) => s.name === tf.name)) continue; // already in staged diff
        const oldContent = headFiles[tf.name] || "";
        if (tf.content !== oldContent) {
          results.push(this.computeDiff(tf.name, oldContent, tf.content));
        }
      }

      return results;
    }

    // Compare two specific commits
    const commit1 = hash1 ? this.getCommit(hash1) : null;
    const commit2 = hash2 ? this.getCommit(hash2) : null;
    const files1 = commit1?.files || {};
    const files2 = commit2?.files || {};

    const allNames = new Set([...Object.keys(files1), ...Object.keys(files2)]);
    const results: DiffResult[] = [];

    for (const name of allNames) {
      const old = files1[name] || "";
      const cur = files2[name] || "";
      if (old !== cur) {
        results.push(this.computeDiff(name, old, cur));
      }
    }

    return results;
  }

  private computeDiff(
    fileName: string,
    oldContent: string,
    newContent: string
  ): DiffResult {
    const changes = diffLines(oldContent, newContent);
    let additions = 0;
    let deletions = 0;
    const hunks: DiffHunk[] = [];

    for (const change of changes) {
      if (change.added) {
        additions += change.count || 0;
        hunks.push({ type: "added", value: change.value });
      } else if (change.removed) {
        deletions += change.count || 0;
        hunks.push({ type: "removed", value: change.value });
      } else {
        hunks.push({ type: "unchanged", value: change.value });
      }
    }

    return { fileName, additions, deletions, hunks };
  }

  // ── Checkout ───────────────────────────────────────────────────────

  checkout(ref: string): CommitObject | null {
    this.assertInitialized();

    // Try as commit hash
    let commit = this.getCommit(ref);
    if (commit) {
      this.restorePromptFiles(commit.files);
      return commit;
    }

    // Try as tag
    const tagFile = path.join(this.vaultPath, REFS_DIR, TAGS_DIR, ref);
    if (fs.existsSync(tagFile)) {
      const hash = fs.readFileSync(tagFile, "utf-8").trim();
      commit = this.getCommit(hash);
      if (commit) {
        this.restorePromptFiles(commit.files);
        return commit;
      }
    }

    // Try as branch
    const branchFile = path.join(
      this.vaultPath, REFS_DIR, HEADS_DIR, ref
    );
    if (fs.existsSync(branchFile)) {
      this.switchBranch(ref);
      const hash = this.getBranchHead(ref);
      return hash ? this.getCommit(hash) : null;
    }

    throw new Error(`Unknown ref: '${ref}'. Not a commit, tag, or branch.`);
  }

  // ── Reset ──────────────────────────────────────────────────────────

  reset(mode: "soft" | "hard" = "soft", ref?: string): void {
    this.assertInitialized();

    if (mode === "soft") {
      // Just clear staging
      this.clearStaging();
      return;
    }

    // Hard reset
    const branch = this.getCurrentBranch();
    if (ref) {
      // Reset to specific commit
      const commit = this.getCommit(ref);
      if (!commit) {
        throw new Error(`Commit '${ref}' not found.`);
      }
      this.setBranchHead(branch, ref);
      this.restorePromptFiles(commit.files);
    } else {
      // Reset to current HEAD
      const head = this.getBranchHead(branch);
      if (head) {
        const commit = this.getCommit(head);
        if (commit) {
          this.restorePromptFiles(commit.files);
        }
      }
    }

    this.clearStaging();
  }

  // ── Merge ──────────────────────────────────────────────────────────

  merge(sourceBranch: string): {
    success: boolean;
    message: string;
    conflicts?: MergeConflict[];
  } {
    this.assertInitialized();
    const currentBranch = this.getCurrentBranch();

    if (sourceBranch === currentBranch) {
      throw new Error("Cannot merge a branch into itself.");
    }

    const sourceHead = this.getBranchHead(sourceBranch);
    if (!sourceHead) {
      throw new Error(`Branch '${sourceBranch}' has no commits.`);
    }

    const currentHead = this.getBranchHead(currentBranch);
    const sourceCommit = this.getCommit(sourceHead)!;
    const currentCommit = currentHead ? this.getCommit(currentHead) : null;

    const currentFiles = currentCommit?.files || {};
    const sourceFiles = sourceCommit.files;

    // Find merge base (simple: walk source parent chain, find common)
    const currentHashes = new Set<string>();
    let walk: string | null = currentHead;
    while (walk) {
      currentHashes.add(walk);
      const c = this.getCommit(walk);
      walk = c?.parent || null;
    }

    let baseHash: string | null = null;
    walk = sourceHead;
    while (walk) {
      if (currentHashes.has(walk)) {
        baseHash = walk;
        break;
      }
      const c = this.getCommit(walk);
      walk = c?.parent || null;
    }

    const baseFiles = baseHash ? this.getCommit(baseHash)?.files || {} : {};

    // Three-way merge
    const allNames = new Set([
      ...Object.keys(currentFiles),
      ...Object.keys(sourceFiles),
      ...Object.keys(baseFiles),
    ]);

    const mergedFiles: Record<string, string> = {};
    const conflicts: MergeConflict[] = [];

    for (const name of allNames) {
      const base = baseFiles[name] || "";
      const ours = currentFiles[name] || "";
      const theirs = sourceFiles[name] || "";

      if (ours === theirs) {
        // No conflict - same content
        if (ours) mergedFiles[name] = ours;
      } else if (ours === base) {
        // Only theirs changed
        if (theirs) mergedFiles[name] = theirs;
      } else if (theirs === base) {
        // Only ours changed
        if (ours) mergedFiles[name] = ours;
      } else {
        // Both changed differently → conflict
        conflicts.push({ fileName: name, ours, theirs });
        // Use theirs for now (in a real system, we'd mark the conflict)
        mergedFiles[name] = theirs;
      }
    }

    if (conflicts.length > 0) {
      return {
        success: false,
        message: `Merge conflicts in ${conflicts.length} file(s). Resolved by taking source branch version.`,
        conflicts,
      };
    }

    // Create merge commit
    const config = this.getConfig();
    const commitData: Omit<CommitObject, "hash"> = {
      parent: currentHead,
      branch: currentBranch,
      message: `Merge branch '${sourceBranch}' into '${currentBranch}'`,
      author: config.author || "unknown",
      timestamp: new Date().toISOString(),
      files: mergedFiles,
    };

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(commitData))
      .digest("hex")
      .slice(0, 12);

    const commit: CommitObject = { hash, ...commitData };

    this.writeJson(
      path.join(this.vaultPath, OBJECTS_DIR, `${hash}.json`),
      commit
    );
    this.setBranchHead(currentBranch, hash);
    this.restorePromptFiles(mergedFiles);

    return {
      success: true,
      message: `Merged '${sourceBranch}' into '${currentBranch}'.`,
    };
  }

  // ── Status ─────────────────────────────────────────────────────────

  status(): {
    branch: string;
    staged: StagedFile[];
    modified: string[];
    untracked: string[];
  } {
    this.assertInitialized();
    const branch = this.getCurrentBranch();
    const staged = this.getStagedFiles();
    const head = this.getBranchHead(branch);
    const headCommit = head ? this.getCommit(head) : null;
    const headFiles = headCommit?.files || {};
    const stagedNames = new Set(staged.map((s) => s.name));

    // Find modified and untracked
    const modified: string[] = [];
    const untracked: string[] = [];
    const promptFiles = this.findPromptFiles();

    for (const pf of promptFiles) {
      const name = this.extractPromptName(path.resolve(pf));
      if (this.isIgnored(path.resolve(pf))) continue;

      const content = fs.readFileSync(pf, "utf-8");

      if (headFiles[name]) {
        // Tracked file - check if modified
        if (content !== headFiles[name] && !stagedNames.has(name)) {
          modified.push(name);
        }
      } else if (!stagedNames.has(name)) {
        // Not tracked and not staged
        untracked.push(name);
      }
    }

    return { branch, staged, modified, untracked };
  }

  // ── Prompt Management ──────────────────────────────────────────────

  listPrompts(): PromptFile[] {
    this.assertInitialized();
    const branch = this.getCurrentBranch();
    const head = this.getBranchHead(branch);
    if (!head) return [];

    const commit = this.getCommit(head);
    if (!commit) return [];

    return Object.entries(commit.files).map(([name, content]) => ({
      name,
      content,
      filePath: path.join(this.vaultPath, PROMPTS_DIR, `${name}.prompt`),
    }));
  }

  getPrompt(name: string): PromptFile | null {
    this.assertInitialized();
    const branch = this.getCurrentBranch();
    const head = this.getBranchHead(branch);
    if (!head) return null;

    const commit = this.getCommit(head);
    if (!commit || !commit.files[name]) return null;

    return {
      name,
      content: commit.files[name],
      filePath: path.join(this.vaultPath, PROMPTS_DIR, `${name}.prompt`),
    };
  }

  searchPrompts(query: string): PromptFile[] {
    const prompts = this.listPrompts();
    const lowerQuery = query.toLowerCase();
    return prompts.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)
    );
  }

  getTrackedFiles(): Array<{ name: string; content: string }> {
    const promptFiles = this.findPromptFiles();
    return promptFiles.map((pf) => ({
      name: this.extractPromptName(path.resolve(pf)),
      content: fs.readFileSync(pf, "utf-8"),
    }));
  }

  // ── Export / Import ────────────────────────────────────────────────

  exportPrompts(format: "json" | "yaml" | "markdown"): string {
    const prompts = this.listPrompts();

    if (format === "json") {
      return JSON.stringify(
        prompts.map((p) => ({ name: p.name, content: p.content })),
        null,
        2
      );
    }

    if (format === "yaml") {
      return prompts
        .map(
          (p) =>
            `- name: ${JSON.stringify(p.name)}\n  content: |\n    ${p.content.replace(/\n/g, "\n    ")}`
        )
        .join("\n\n");
    }

    // markdown
    return prompts
      .map((p) => `# ${p.name}\n\n${p.content}`)
      .join("\n\n---\n\n");
  }

  importPrompts(
    filePath: string,
    format?: "json" | "yaml"
  ): Array<{ name: string; content: string }> {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const raw = fs.readFileSync(absPath, "utf-8");
    let prompts: Array<{ name: string; content: string }>;

    const ext = path.extname(absPath).toLowerCase();
    const effectiveFormat = format || (ext === ".yaml" || ext === ".yml" ? "yaml" : "json");

    if (effectiveFormat === "json") {
      const parsed = JSON.parse(raw);
      prompts = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // Simple YAML parsing for our format
      const entries = raw.split(/^- name:/m).filter(Boolean);
      prompts = entries.map((entry) => {
        const nameMatch = entry.match(/^\s*["']?(.+?)["']?\s*$/m);
        const contentMatch = entry.match(/content:\s*\|\s*\n([\s\S]*?)(?=\n- name:|$)/);
        return {
          name: nameMatch?.[1]?.trim() || "unnamed",
          content: contentMatch?.[1]?.replace(/^ {4}/gm, "").trim() || "",
        };
      });
    }

    // Write imported prompts as files
    for (const p of prompts) {
      const fileName = `${p.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.prompt`;
      const outPath = path.join(this.root, fileName);
      fs.writeFileSync(outPath, p.content, "utf-8");
    }

    return prompts;
  }

  // ── Template ───────────────────────────────────────────────────────

  renderTemplate(
    content: string,
    variables: Record<string, string>
  ): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables) return variables[key];
      return match; // leave unresolved variables as-is
    });
  }

  extractTemplateVariables(content: string): string[] {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(2, -2)))];
  }

  // ── Linting ────────────────────────────────────────────────────────

  lintPrompt(content: string): Array<{
    level: "warning" | "error" | "info";
    message: string;
  }> {
    const issues: Array<{ level: "warning" | "error" | "info"; message: string }> = [];

    if (content.trim().length === 0) {
      issues.push({ level: "error", message: "Prompt is empty." });
      return issues;
    }

    if (content.length > 50000) {
      issues.push({
        level: "warning",
        message: `Prompt is very long (${content.length} chars). Consider breaking it into smaller prompts.`,
      });
    }

    if (content.length < 10) {
      issues.push({
        level: "warning",
        message: "Prompt is very short. Consider adding more context.",
      });
    }

    // Check for common issues
    const lines = content.split("\n");
    if (lines.length > 1 && lines[lines.length - 1].trim() === "") {
      issues.push({
        level: "info",
        message: "Prompt has trailing whitespace.",
      });
    }

    // Check for unresolved template variables
    const vars = this.extractTemplateVariables(content);
    if (vars.length > 0) {
      issues.push({
        level: "info",
        message: `Contains template variables: ${vars.map((v) => `{{${v}}}`).join(", ")}`,
      });
    }

    // Check for unclear instructions
    const lowerContent = content.toLowerCase();
    if (
      !lowerContent.includes("you") &&
      !lowerContent.includes("please") &&
      !lowerContent.includes("generate") &&
      !lowerContent.includes("write") &&
      !lowerContent.includes("create") &&
      !lowerContent.includes("explain") &&
      content.length > 50
    ) {
      issues.push({
        level: "info",
        message: "Consider adding a clear instruction or action verb.",
      });
    }

    // Estimate tokens
    const estimatedTokens = Math.ceil(content.length / 4);
    if (estimatedTokens > 4000) {
      issues.push({
        level: "warning",
        message: `Estimated ~${estimatedTokens} tokens. May be expensive to run.`,
      });
    }

    return issues;
  }

  // ── .pvignore ──────────────────────────────────────────────────────

  private isIgnored(absPath: string): boolean {
    const ignoreFile = path.join(this.root, IGNORE_FILE);
    if (!fs.existsSync(ignoreFile)) return false;

    const patterns = fs
      .readFileSync(ignoreFile, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));

    const relPath = path.relative(this.root, absPath);
    for (const pattern of patterns) {
      if (this.matchesIgnorePattern(relPath, pattern)) return true;
    }

    return false;
  }

  private matchesIgnorePattern(filePath: string, pattern: string): boolean {
    // Simple glob matching
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*")
          .replace(/\?/g, ".") +
        "$"
    );
    return regex.test(filePath) || regex.test(path.basename(filePath));
  }

  // ── Helpers ────────────────────────────────────────────────────────

  private extractPromptName(absPath: string): string {
    const base = path.basename(absPath);
    const ext = path.extname(base);
    return base.slice(0, base.length - ext.length);
  }

  findPromptFiles(): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(this.root);

    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      const fullPath = path.join(this.root, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isFile() && PROMPT_EXTENSIONS.includes(path.extname(entry).toLowerCase())) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private restorePromptFiles(files: Record<string, string>): void {
    // Write prompt files to the prompts directory
    for (const [name, content] of Object.entries(files)) {
      const promptFile = path.join(
        this.vaultPath, PROMPTS_DIR, `${name}.prompt`
      );
      fs.writeFileSync(promptFile, content, "utf-8");
    }
  }

  private readJson<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  private writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  getRoot(): string {
    return this.root;
  }

  getVaultPath(): string {
    return this.vaultPath;
  }
}
