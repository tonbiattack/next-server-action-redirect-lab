import { redirect } from "next/navigation";

export type CreatePostResult =
  | { readonly status: "validation-error"; readonly message: string }
  | { readonly status: "storage-error"; readonly message: string };

export interface PostRepository {
  create(input: { readonly title: string }): Promise<{ readonly id: string }>;
}

function readTitle(formData: FormData): string | null {
  const rawTitle = formData.get("title");
  if (typeof rawTitle !== "string") return null;

  const title = rawTitle.trim();
  return title.length > 0 ? title : null;
}

/**
 * Server Actionから呼び出す投稿作成処理。
 *
 * BUG: redirect() は通常の戻り値ではなく、Next.js が扱うリダイレクト用の
 * 例外シグナルを送出する。この広いcatchは保存エラーだけでなく、その成功時の
 * シグナルまでstorage-errorとして扱ってしまう。
 */
export async function createPostAndNavigate(
  formData: FormData,
  repository: PostRepository,
): Promise<CreatePostResult> {
  const title = readTitle(formData);
  if (title === null) {
    return {
      status: "validation-error",
      message: "タイトルは空でない文字列で指定してください。",
    };
  }

  try {
    const post = await repository.create({ title });
    redirect(`/posts/${post.id}`);
  } catch {
    return {
      status: "storage-error",
      message: "投稿を保存できませんでした。",
    };
  }
}
