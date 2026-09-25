export async function getRepoFiles(fullName: string, githubToken?: string | null) {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Testpilot-Agent',
    };
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }

    const treeUrl = `https://api.github.com/repos/${fullName}/git/trees/HEAD?recursive=1`;
    const treeRes = await fetch(treeUrl, { headers });

    if (!treeRes.ok) {
      console.warn('GitHub tree fetch status:', treeRes.status, 'fullName:', fullName);
      return [];
    }

    const treeData = await treeRes.json();
    if (!treeData.tree || !Array.isArray(treeData.tree)) {
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
    }).slice(0, 30);

    const filesWithContent = await Promise.all(
      filteredFiles.map(async (file: any) => {
        try {
          const contentRes = await fetch(`https://api.github.com/repos/${fullName}/contents/${file.path}`, {
            headers: {
              ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
              Accept: 'application/vnd.github.v3.raw',
              'User-Agent': 'Testpilot-Agent',
            }
          });
          const content = contentRes.ok ? await contentRes.text() : '';
          return { path: file.path, content };
        } catch {
          return { path: file.path, content: '' };
        }
      })
    );

    return filesWithContent;
  } catch (error) {
    console.error('getRepoFiles error:', error);
    return [];
  }
}
