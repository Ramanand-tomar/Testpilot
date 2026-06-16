export async function getRepoFiles(fullName: string, githubToken: string) {
  const treeUrl = `https://api.github.com/repos/${fullName}/git/trees/HEAD?recursive=1`;
  const treeRes = await fetch(treeUrl, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github.v3+json',
    }
  });

  if (!treeRes.ok) {
    const errorText = await treeRes.text();
    console.error('GitHub tree fetch failed:', treeRes.status, errorText, 'fullName:', fullName);
    throw new Error(`Failed to fetch repository tree: ${treeRes.status} ${errorText}`);
  }

  const treeData = await treeRes.json();
  
  if (!treeData.tree) {
    return [];
  }
  
  const allFiles = treeData.tree.filter((item: any) => item.type === 'blob');

  const ignorePatterns = [
    /node_modules\//, /\.git\//, /\.env$/, /\.lock$/, /dist\//, /\.next\//,
    /\.png$/, /\.jpg$/, /\.jpeg$/, /\.svg$/, /\.ico$/, /\.woff$/, /\.woff2$/,
    /\.ttf$/, /\.eot$/, /package-lock\.json$/, /yarn\.lock$/, /pnpm-lock\.yaml$/
  ];

  const filteredFiles = allFiles.filter((file: any) => {
    return !ignorePatterns.some(pattern => pattern.test(file.path));
  }).slice(0, 50);

  const filesWithContent = await Promise.all(
    filteredFiles.map(async (file: any) => {
      const contentRes = await fetch(`https://api.github.com/repos/${fullName}/contents/${file.path}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3.raw',
        }
      });
      const content = contentRes.ok ? await contentRes.text() : '';
      return { path: file.path, content };
    })
  );

  return filesWithContent;
}
