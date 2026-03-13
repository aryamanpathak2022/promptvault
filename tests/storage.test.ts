import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { VaultStorage } from "../cli/storage.js";

let testDir: string;

function setup(): VaultStorage {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "pv-test-"));
  const storage = new VaultStorage(testDir);
  storage.init("TestUser", "test@example.com");
  return storage;
}

function cleanup(): void {
  if (testDir && fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
}

function writePrompt(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, `${name}.prompt`);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

// ── Initialization ─────────────────────────────────────────────────────

describe("VaultStorage - Initialization", () => {
  afterEach(cleanup);

  it("should initialize a new vault", () => {
    const storage = setup();
    expect(storage.isInitialized()).toBe(true);
    expect(fs.existsSync(path.join(testDir, ".promptvault"))).toBe(true);
    expect(fs.existsSync(path.join(testDir, ".promptvault", "config.json"))).toBe(true);
    expect(fs.existsSync(path.join(testDir, ".promptvault", "HEAD"))).toBe(true);
  });

  it("should throw if already initialized", () => {
    const storage = setup();
    expect(() => storage.init()).toThrow("already initialized");
  });

  it("should store author and email in config", () => {
    const storage = setup();
    const config = storage.getConfig();
    expect(config.author).toBe("TestUser");
    expect(config.email).toBe("test@example.com");
  });

  it("should start on the main branch", () => {
    const storage = setup();
    expect(storage.getCurrentBranch()).toBe("main");
  });
});

// ── Staging ────────────────────────────────────────────────────────────

describe("VaultStorage - Staging", () => {
  afterEach(cleanup);

  it("should stage a file", () => {
    const storage = setup();
    const filePath = writePrompt(testDir, "test", "Hello world");
    storage.stageFile(filePath);
    const staged = storage.getStagedFiles();
    expect(staged).toHaveLength(1);
    expect(staged[0].name).toBe("test");
    expect(staged[0].content).toBe("Hello world");
  });

  it("should replace existing staged file", () => {
    const storage = setup();
    const filePath = writePrompt(testDir, "test", "Version 1");
    storage.stageFile(filePath);
    writePrompt(testDir, "test", "Version 2");
    storage.stageFile(filePath);
    const staged = storage.getStagedFiles();
    expect(staged).toHaveLength(1);
    expect(staged[0].content).toBe("Version 2");
  });

  it("should throw when staging non-existent file", () => {
    const storage = setup();
    expect(() => storage.stageFile("/nonexistent/file.prompt")).toThrow("File not found");
  });

  it("should unstage a file", () => {
    const storage = setup();
    const filePath = writePrompt(testDir, "test", "Content");
    storage.stageFile(filePath);
    storage.unstageFile("test");
    expect(storage.getStagedFiles()).toHaveLength(0);
  });

  it("should throw when unstaging a non-staged file", () => {
    const storage = setup();
    expect(() => storage.unstageFile("nonexistent")).toThrow("not staged");
  });

  it("should clear all staged files", () => {
    const storage = setup();
    writePrompt(testDir, "a", "A");
    writePrompt(testDir, "b", "B");
    storage.stageFile(path.join(testDir, "a.prompt"));
    storage.stageFile(path.join(testDir, "b.prompt"));
    expect(storage.getStagedFiles()).toHaveLength(2);
    storage.clearStaging();
    expect(storage.getStagedFiles()).toHaveLength(0);
  });
});

// ── Commits ────────────────────────────────────────────────────────────

describe("VaultStorage - Commits", () => {
  afterEach(cleanup);

  it("should create a commit", () => {
    const storage = setup();
    writePrompt(testDir, "greeting", "Hello, how can I help?");
    storage.stageFile(path.join(testDir, "greeting.prompt"));
    const commit = storage.commit("Add greeting prompt");

    expect(commit.hash).toHaveLength(12);
    expect(commit.message).toBe("Add greeting prompt");
    expect(commit.author).toBe("TestUser");
    expect(commit.files["greeting"]).toBe("Hello, how can I help?");
    expect(commit.parent).toBeNull();
  });

  it("should clear staging after commit", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");
    expect(storage.getStagedFiles()).toHaveLength(0);
  });

  it("should chain commits with parent pointers", () => {
    const storage = setup();
    writePrompt(testDir, "test", "V1");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const c1 = storage.commit("First");

    writePrompt(testDir, "test", "V2");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const c2 = storage.commit("Second");

    expect(c2.parent).toBe(c1.hash);
    expect(c1.parent).toBeNull();
  });

  it("should throw when committing with nothing staged", () => {
    const storage = setup();
    expect(() => storage.commit("Empty")).toThrow("Nothing to commit");
  });

  it("should accumulate files across commits", () => {
    const storage = setup();
    writePrompt(testDir, "a", "Content A");
    storage.stageFile(path.join(testDir, "a.prompt"));
    storage.commit("Add A");

    writePrompt(testDir, "b", "Content B");
    storage.stageFile(path.join(testDir, "b.prompt"));
    const c2 = storage.commit("Add B");

    expect(Object.keys(c2.files)).toHaveLength(2);
    expect(c2.files["a"]).toBe("Content A");
    expect(c2.files["b"]).toBe("Content B");
  });
});

// ── Log ────────────────────────────────────────────────────────────────

describe("VaultStorage - Log", () => {
  afterEach(cleanup);

  it("should return empty log with no commits", () => {
    const storage = setup();
    expect(storage.getLog()).toHaveLength(0);
  });

  it("should return commits in reverse chronological order", () => {
    const storage = setup();
    writePrompt(testDir, "test", "V1");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("First");

    writePrompt(testDir, "test", "V2");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Second");

    const log = storage.getLog();
    expect(log).toHaveLength(2);
    expect(log[0].message).toBe("Second");
    expect(log[1].message).toBe("First");
  });
});

// ── Branches ───────────────────────────────────────────────────────────

describe("VaultStorage - Branches", () => {
  afterEach(cleanup);

  it("should create a branch", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    storage.createBranch("feature");
    const branches = storage.getBranches();
    expect(branches).toContain("feature");
  });

  it("should throw on duplicate branch", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    storage.createBranch("feature");
    expect(() => storage.createBranch("feature")).toThrow("already exists");
  });

  it("should switch branches", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    storage.createBranch("feature");
    storage.switchBranch("feature");
    expect(storage.getCurrentBranch()).toBe("feature");
  });

  it("should prevent switching with staged files", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    storage.createBranch("feature");
    writePrompt(testDir, "other", "Other");
    storage.stageFile(path.join(testDir, "other.prompt"));
    expect(() => storage.switchBranch("feature")).toThrow("staged changes");
  });

  it("should delete a branch", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    storage.createBranch("feature");
    storage.deleteBranch("feature");
    expect(storage.getBranches()).not.toContain("feature");
  });

  it("should prevent deleting current branch", () => {
    const storage = setup();
    expect(() => storage.deleteBranch("main")).toThrow("Cannot delete");
  });
});

// ── Tags ───────────────────────────────────────────────────────────────

describe("VaultStorage - Tags", () => {
  afterEach(cleanup);

  it("should create a tag", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const commit = storage.commit("Initial");

    storage.createTag("v1.0");
    const tags = storage.getTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe("v1.0");
    expect(tags[0].hash).toBe(commit.hash);
  });

  it("should throw on duplicate tag", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    storage.createTag("v1.0");
    expect(() => storage.createTag("v1.0")).toThrow("already exists");
  });

  it("should delete a tag", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    storage.createTag("v1.0");
    storage.deleteTag("v1.0");
    expect(storage.getTags()).toHaveLength(0);
  });
});

// ── Diff ───────────────────────────────────────────────────────────────

describe("VaultStorage - Diff", () => {
  afterEach(cleanup);

  it("should show diff for staged files", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Line 1\nLine 2\n");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const results = storage.diff();
    expect(results).toHaveLength(1);
    expect(results[0].additions).toBeGreaterThan(0);
  });

  it("should compare two commits", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Original content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const c1 = storage.commit("First");

    writePrompt(testDir, "test", "Updated content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const c2 = storage.commit("Second");

    const results = storage.diff(c1.hash, c2.hash);
    expect(results).toHaveLength(1);
    expect(results[0].fileName).toBe("test");
  });
});

// ── Merge ──────────────────────────────────────────────────────────────

describe("VaultStorage - Merge", () => {
  afterEach(cleanup);

  it("should merge branches without conflicts", () => {
    const storage = setup();
    writePrompt(testDir, "shared", "Base content");
    storage.stageFile(path.join(testDir, "shared.prompt"));
    storage.commit("Initial");

    storage.createBranch("feature");
    storage.switchBranch("feature");
    writePrompt(testDir, "newfile", "New feature");
    storage.stageFile(path.join(testDir, "newfile.prompt"));
    storage.commit("Add new file on feature");

    storage.switchBranch("main");
    const result = storage.merge("feature");
    expect(result.success).toBe(true);
  });

  it("should prevent merging branch into itself", () => {
    const storage = setup();
    expect(() => storage.merge("main")).toThrow("Cannot merge a branch into itself");
  });
});

// ── Reset ──────────────────────────────────────────────────────────────

describe("VaultStorage - Reset", () => {
  afterEach(cleanup);

  it("should soft reset (clear staging)", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    expect(storage.getStagedFiles()).toHaveLength(1);
    storage.reset("soft");
    expect(storage.getStagedFiles()).toHaveLength(0);
  });

  it("should hard reset to HEAD", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Original");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    writePrompt(testDir, "test", "Modified");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.reset("hard");
    expect(storage.getStagedFiles()).toHaveLength(0);
  });
});

// ── Prompt Management ──────────────────────────────────────────────────

describe("VaultStorage - Prompt Management", () => {
  afterEach(cleanup);

  it("should list prompts", () => {
    const storage = setup();
    writePrompt(testDir, "a", "A");
    writePrompt(testDir, "b", "B");
    storage.stageFile(path.join(testDir, "a.prompt"));
    storage.stageFile(path.join(testDir, "b.prompt"));
    storage.commit("Add prompts");

    const prompts = storage.listPrompts();
    expect(prompts).toHaveLength(2);
    expect(prompts.map((p) => p.name).sort()).toEqual(["a", "b"]);
  });

  it("should get a specific prompt", () => {
    const storage = setup();
    writePrompt(testDir, "greeting", "Hello!");
    storage.stageFile(path.join(testDir, "greeting.prompt"));
    storage.commit("Add greeting");

    const prompt = storage.getPrompt("greeting");
    expect(prompt).not.toBeNull();
    expect(prompt!.content).toBe("Hello!");
  });

  it("should return null for non-existent prompt", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    expect(storage.getPrompt("nonexistent")).toBeNull();
  });

  it("should search prompts by content", () => {
    const storage = setup();
    writePrompt(testDir, "coding", "You are a coding assistant");
    writePrompt(testDir, "writing", "You are a writing assistant");
    storage.stageFile(path.join(testDir, "coding.prompt"));
    storage.stageFile(path.join(testDir, "writing.prompt"));
    storage.commit("Add prompts");

    const results = storage.searchPrompts("coding");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("coding");
  });

  it("should search prompts by name", () => {
    const storage = setup();
    writePrompt(testDir, "my-prompt", "Content");
    storage.stageFile(path.join(testDir, "my-prompt.prompt"));
    storage.commit("Add prompt");

    const results = storage.searchPrompts("my-prompt");
    expect(results).toHaveLength(1);
  });
});

// ── Templates ──────────────────────────────────────────────────────────

describe("VaultStorage - Templates", () => {
  afterEach(cleanup);

  it("should extract template variables", () => {
    const storage = setup();
    const vars = storage.extractTemplateVariables(
      "Hello {{name}}, you are {{role}}. {{name}} again."
    );
    expect(vars).toEqual(["name", "role"]);
  });

  it("should render template with variables", () => {
    const storage = setup();
    const rendered = storage.renderTemplate(
      "Hello {{name}}, your role is {{role}}.",
      { name: "Alice", role: "developer" }
    );
    expect(rendered).toBe("Hello Alice, your role is developer.");
  });

  it("should leave unresolved variables as-is", () => {
    const storage = setup();
    const rendered = storage.renderTemplate(
      "Hello {{name}}, {{unknown}} here.",
      { name: "Bob" }
    );
    expect(rendered).toBe("Hello Bob, {{unknown}} here.");
  });
});

// ── Linting ────────────────────────────────────────────────────────────

describe("VaultStorage - Linting", () => {
  afterEach(cleanup);

  it("should detect empty prompt", () => {
    const storage = setup();
    const issues = storage.lintPrompt("");
    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe("error");
  });

  it("should detect very short prompt", () => {
    const storage = setup();
    const issues = storage.lintPrompt("Hi");
    expect(issues.some((i) => i.message.includes("very short"))).toBe(true);
  });

  it("should detect very long prompt", () => {
    const storage = setup();
    const longContent = "x".repeat(60000);
    const issues = storage.lintPrompt(longContent);
    expect(issues.some((i) => i.message.includes("very long"))).toBe(true);
  });

  it("should detect template variables", () => {
    const storage = setup();
    const issues = storage.lintPrompt("Hello {{name}}, please write {{task}}");
    expect(issues.some((i) => i.message.includes("template variables"))).toBe(true);
  });
});

// ── Export / Import ────────────────────────────────────────────────────

describe("VaultStorage - Export/Import", () => {
  afterEach(cleanup);

  it("should export as JSON", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Add");

    const exported = storage.exportPrompts("json");
    const parsed = JSON.parse(exported);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe("test");
    expect(parsed[0].content).toBe("Content");
  });

  it("should export as markdown", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Add");

    const exported = storage.exportPrompts("markdown");
    expect(exported).toContain("# test");
    expect(exported).toContain("Content");
  });

  it("should import from JSON file", () => {
    const storage = setup();
    const importFile = path.join(testDir, "import.json");
    fs.writeFileSync(
      importFile,
      JSON.stringify([
        { name: "imported", content: "Imported content" },
      ]),
      "utf-8"
    );

    const imported = storage.importPrompts(importFile);
    expect(imported).toHaveLength(1);
    expect(imported[0].name).toBe("imported");

    // Verify file was written
    expect(fs.existsSync(path.join(testDir, "imported.prompt"))).toBe(true);
  });
});

// ── Status ─────────────────────────────────────────────────────────────

describe("VaultStorage - Status", () => {
  afterEach(cleanup);

  it("should show empty status with no files", () => {
    const storage = setup();
    const status = storage.status();
    expect(status.branch).toBe("main");
    expect(status.staged).toHaveLength(0);
    expect(status.modified).toHaveLength(0);
    expect(status.untracked).toHaveLength(0);
  });

  it("should show untracked files", () => {
    const storage = setup();
    writePrompt(testDir, "new", "Content");
    const status = storage.status();
    expect(status.untracked).toContain("new");
  });

  it("should show staged files", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const status = storage.status();
    expect(status.staged).toHaveLength(1);
    expect(status.staged[0].name).toBe("test");
  });

  it("should show modified files", () => {
    const storage = setup();
    writePrompt(testDir, "test", "Original");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    writePrompt(testDir, "test", "Modified");
    const status = storage.status();
    expect(status.modified).toContain("test");
  });
});

// ── Checkout ───────────────────────────────────────────────────────────

describe("VaultStorage - Checkout", () => {
  afterEach(cleanup);

  it("should checkout a specific commit", () => {
    const storage = setup();
    writePrompt(testDir, "test", "V1");
    storage.stageFile(path.join(testDir, "test.prompt"));
    const c1 = storage.commit("First");

    writePrompt(testDir, "test", "V2");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Second");

    const result = storage.checkout(c1.hash);
    expect(result).not.toBeNull();
    expect(result!.message).toBe("First");
  });

  it("should throw for unknown ref", () => {
    const storage = setup();
    expect(() => storage.checkout("nonexistent")).toThrow("Unknown ref");
  });
});

// ── Config ─────────────────────────────────────────────────────────────

describe("VaultStorage - Config", () => {
  afterEach(cleanup);

  it("should get and set config", () => {
    const storage = setup();
    storage.setConfig({ author: "NewAuthor" });
    const config = storage.getConfig();
    expect(config.author).toBe("NewAuthor");
  });

  it("should set remotes", () => {
    const storage = setup();
    storage.setConfig({ remotes: { origin: "/path/to/remote" } });
    const config = storage.getConfig();
    expect(config.remotes?.origin).toBe("/path/to/remote");
  });
});

// ── Clone ──────────────────────────────────────────────────────────────

describe("VaultStorage - Clone", () => {
  afterEach(cleanup);

  it("should clone a local vault", () => {
    // Set up source vault
    const storage = setup();
    writePrompt(testDir, "test", "Content");
    storage.stageFile(path.join(testDir, "test.prompt"));
    storage.commit("Initial");

    // Clone it
    const cloneDir = testDir + "-clone";
    const cloneStorage = new VaultStorage(cloneDir);

    // Manual clone (simulates clone command logic)
    fs.mkdirSync(cloneDir, { recursive: true });
    cloneStorage.init();

    // Copy objects
    const srcObjects = path.join(testDir, ".promptvault", "objects");
    const dstObjects = path.join(cloneDir, ".promptvault", "objects");
    for (const file of fs.readdirSync(srcObjects)) {
      fs.copyFileSync(path.join(srcObjects, file), path.join(dstObjects, file));
    }

    // Copy refs
    const srcHeads = path.join(testDir, ".promptvault", "refs", "heads");
    const dstHeads = path.join(cloneDir, ".promptvault", "refs", "heads");
    for (const file of fs.readdirSync(srcHeads)) {
      fs.copyFileSync(path.join(srcHeads, file), path.join(dstHeads, file));
    }

    // Verify clone
    const clonedStorage = new VaultStorage(cloneDir);
    const log = clonedStorage.getLog();
    expect(log).toHaveLength(1);
    expect(log[0].message).toBe("Initial");

    // Clean up clone dir
    fs.rmSync(cloneDir, { recursive: true });
  });
});
