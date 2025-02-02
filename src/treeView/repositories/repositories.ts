import vscode from 'vscode';
import { uiCreateRepo } from '../../commandsUi/uiCreateRepo';
import { uiPublish } from '../../commandsUi/uiPublish/uiPublish';
import { RepositoriesState, User } from '../../store/user';
import { BaseTreeDataProvider, TreeItem } from '../treeViewBase';
import { activateClonedRepos, getClonedTreeItem } from './clonedRepos';
import { activateNotClonedRepos, getNotClonedTreeItem } from './notClonedRepos';
import type { RepoItem } from './repoItem';



export function activateTreeViewRepositories(): void {
  const repositoriesTreeDataProvider = new TreeDataProvider();

  vscode.window.registerTreeDataProvider('githubRepoMgr.views.repositories',
    repositoriesTreeDataProvider);
  User.subscribe('repos', () => { repositoriesTreeDataProvider.refresh(); });

  // Access GitHub Web Page
  vscode.commands.registerCommand('githubRepoMgr.commands.repos.openWebPage', ({ repo }: RepoItem) =>
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(repo.url)));

  // Will have .git on the end.
  vscode.commands.registerCommand('githubRepoMgr.commands.repos.copyRepositoryUrl', ({ repo }: RepoItem) =>
    vscode.env.clipboard.writeText(`${repo.url}.git`));

  // Reload repos
  vscode.commands.registerCommand('githubRepoMgr.commands.repos.reload', () => User.reloadRepos());

  // Create Repo
  vscode.commands.registerCommand('githubRepoMgr.commands.repos.createRepo', () => uiCreateRepo());


  vscode.commands.registerCommand('githubRepoMgr.commands.repos.publish', () => uiPublish());


  activateClonedRepos();
  activateNotClonedRepos();
}



class TreeDataProvider extends BaseTreeDataProvider {
  constructor() { super(); }
  getData() {
    switch (User.repositoriesState) {
      case RepositoriesState.none:
        return []; // So on not logged user it won't be 'Loading...' for ever.
      case RepositoriesState.fetching:
        return new TreeItem({
          label: 'Loading...',
        });
      case RepositoriesState.partial:
      case RepositoriesState.fullyLoaded:
        return [getClonedTreeItem(), getNotClonedTreeItem()];
    }
  }
  protected makeData() {
    this.data = this.getData();
  }
}
