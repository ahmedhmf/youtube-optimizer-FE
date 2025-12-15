export function isValidYoutubeUrl(url: string): boolean {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/;
  return youtubeRegex.test(url);
}
