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
 * redirect() は通常の戻り値ではなく、Next.js が扱うリダイレクト用の
 * 例外シグナルを送出する。保存失敗だけをtry/catchで処理し、成功後の
 * シグナルは呼び出し元まで伝播させる。
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

  let post: { readonly id: string };
  try {
    post = await repository.create({ title });
  } catch {
    return {
      status: "storage-error",
      message: "投稿を保存できませんでした。",
    };
  }

  // redirect()はNEXT_REDIRECT例外シグナルを送出するため、保存失敗だけを扱う
  // try/catchの外で実行し、Next.jsの呼び出し元まで伝播させる。
  redirect(`/posts/${post.id}`);
}
