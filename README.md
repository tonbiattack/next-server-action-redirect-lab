# next-server-action-redirect-lab

Next.js App RouterのServer Actionで、成功後の`redirect()`を広い`try/catch`の内側で呼ぶと、遷移が「保存エラー」として処理される問題を再現する最小プロジェクトです。

## 前提環境

| 項目 | 固定値 |
|---|---:|
| Node.js | 22.13.0で検証 |
| Next.js | 16.3.1 |
| React / React DOM | 19.2.3 |
| TypeScript | 5.9.3 |
| `tsx` | 4.20.6 |

## セットアップ

```bash
npm install
```

## テスト

修正後の`main`では、次のコマンドが成功します。

```bash
npm run typecheck
npm run test:chapter-01
npm test
npm run build
```

失敗状態はGit履歴の再現コミットから確認できます。保存処理が成功したとき、テストは`/posts/post-001`への`NEXT_REDIRECT`シグナルが呼び出し元まで届くことを要求します。バグ状態では広い`catch`がそのシグナルを`storage-error`に変換するため、同じテストが失敗します。

## 構成

| パス | 役割 |
|---|---|
| `lib/createPost.ts` | バグを含む投稿作成・リダイレクトの最小ロジック |
| `app/actions.ts` | `"use server"`を持つ実際のServer Actionモジュール |
| `tests/create-post-action.test.ts` | 成功時のredirect、検証エラー、保存エラーを検証するテスト |
| `app/` | Next.jsの本番ビルドを検証する最小App Routerエントリ |

## 学べる契約

`redirect()`は通常の戻り値を返す関数ではありません。Next.jsは`NEXT_REDIRECT`を持つ例外シグナルとして遷移を表すため、Server Actionで`try/catch`を使う場合は、成功後の`redirect()`を例外処理の外へ置く必要があります。[1]

## 参考資料

[1]: https://nextjs.org/docs/app/api-reference/functions/redirect "Next.js — redirect"
