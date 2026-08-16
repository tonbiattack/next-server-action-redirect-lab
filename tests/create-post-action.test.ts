import assert from "node:assert/strict";
import test from "node:test";

import {
  createPostAndNavigate,
  type PostRepository,
} from "../lib/createPost";

function formDataWithTitle(title: string): FormData {
  const formData = new FormData();
  formData.set("title", title);
  return formData;
}

function assertRedirectTo(error: unknown, expectedPath: string): boolean {
  assert.ok(error instanceof Error, "redirectシグナルはErrorであるべきです");
  assert.equal(error.message, "NEXT_REDIRECT");

  const digest = (error as Error & { digest?: unknown }).digest;
  if (typeof digest !== "string") {
    assert.fail("redirect digestは文字列であるべきです");
  }
  assert.match(
    digest,
    new RegExp(
      `^NEXT_REDIRECT;(push|replace);${expectedPath.replaceAll("/", "\\/")};307;$`,
    ),
    "Next.jsが解釈できるredirect digestを呼び出し元まで伝播させるべきです",
  );
  return true;
}

const successfulRepository: PostRepository = {
  async create({ title }) {
    assert.equal(title, "設計メモ");
    return { id: "post-001" };
  },
};

test("第01章: 保存に成功したServer Actionは投稿詳細へのredirectシグナルを伝播する", async () => {
  await assert.rejects(
    createPostAndNavigate(formDataWithTitle("  設計メモ  "), successfulRepository),
    (error: unknown) => assertRedirectTo(error, "/posts/post-001"),
  );
});

test("第01章: 空のタイトルはredirectせず検証エラーを返す", async () => {
  const result = await createPostAndNavigate(
    formDataWithTitle("   "),
    successfulRepository,
  );

  assert.deepEqual(result, {
    status: "validation-error",
    message: "タイトルは空でない文字列で指定してください。",
  });
});

test("第01章: 保存処理の失敗はstorage-errorとして処理する", async () => {
  const failingRepository: PostRepository = {
    async create() {
      throw new Error("database is unavailable");
    },
  };

  const result = await createPostAndNavigate(
    formDataWithTitle("設計メモ"),
    failingRepository,
  );

  assert.deepEqual(result, {
    status: "storage-error",
    message: "投稿を保存できませんでした。",
  });
});
