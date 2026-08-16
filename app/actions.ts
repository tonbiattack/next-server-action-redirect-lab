"use server";

import {
  createPostAndNavigate,
  type CreatePostResult,
  type PostRepository,
} from "@/lib/createPost";

const repository: PostRepository = {
  async create({ title }) {
    // このラボでは外部DBを使わず、制御フローだけを決定的に再現する。
    return { id: `saved-${title.toLowerCase().replaceAll(/\s+/g, "-")}` };
  },
};

export async function createPostAction(
  formData: FormData,
): Promise<CreatePostResult> {
  return createPostAndNavigate(formData, repository);
}
