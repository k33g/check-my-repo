const {app, ipcMain, BrowserWindow} = require('electron');

const GitHubClient = require('./js/GitHubClient')

let githubCli = new GitHubClient({
  baseUri:"https://api.github.com",
  token:process.env.TOKEN_GITHUB_DOT_COM
});

let getEvents = ({owner, repo, sender}) => {
  githubCli.getData({path:`/networks/${owner}/${repo}/events`}).then(response => {
    githubCli.headers["If-None-Match"] = response.headers.get('etag')

    if(response.status == 200) {
      let lastEvent = response.data[0];

      //console.log(lastEvent)
      if(lastEvent.type == "CreateEvent") {
        console.log(lastEvent.payload.ref)
        console.log(lastEvent.payload.ref_type)
        console.log(lastEvent.actor.login)
      }

      if(lastEvent.type == "PushEvent") {
        let ref = lastEvent.payload.ref.split("refs/heads/")[1];

        let filesList = [];
        let counter = 0;

        let handleNameOfCommitAuthor = lastEvent.actor.login;

        lastEvent.payload.commits.forEach(commit => {
          //console.log(commit)
          githubCli.getData({path:`/repos/${handleNameOfCommitAuthor}/${repo}/commits/${commit.sha}`})
            .then(response => {
              let filesOfCommit = response.data.files;

              filesOfCommit.forEach(file => {
                if(file.filename.split('.').pop()=="md") {
                  // change the status of the PR
                  githubCli.postData({
                    path:`/repos/${owner}/${repo}/statuses/${commit.sha}`,
                    data: {
                      state: "success", // pending success error failure
                      description: "you're the best"
                    }
                  })
                } else {
                  // change the status of the PR
                  githubCli.postData({
                    path:`/repos/${owner}/${repo}/statuses/${commit.sha}`,
                    data: {
                      state: "failure", // pending success error failure
                      description: "ouch!"
                    }
                  })
                }
              })

              filesList = filesList.concat(filesOfCommit)
              counter++
              if(counter==lastEvent.payload.commits.length) {
                console.log(filesList)
                sender.send("PushEvent", {ref: ref, commits: lastEvent.payload.commits, filesList: filesList})
              }
            })
        })
      }
    }
  })
  .catch(error => {
    console.log(">>> error:", error)
  })
}


app.on('ready', () => {
  mainWindow = new BrowserWindow();
  mainWindow.webContents.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.on('did-finish-load', () => {

    setInterval(() => {
      // Don't forget to set owner and repository with your own data
      getEvents({owner: "k33g", repo: "sandbox-api", sender: mainWindow.webContents})

    }, 4000)

  })
});

ipcMain.on('close-main-window', (event, arg) => {
  app.quit();
});
