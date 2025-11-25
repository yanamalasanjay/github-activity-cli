#!/usr/bin/env node
// github-activity-cli/github-activity.js
// to run this file, use the command: node github-activity.js <github-username>
// to deal with the  http  we need http module from node so import it


const https=require('https');
const username=process.argv[2];
if(!username){
    console.error("Please provide a GitHub username as a command-line argument.");
    process.exit(1);
}
//  prepare request options
const options={
  hostname:'api.github.com',
  path:`/users/${username}/events`,
  method:'GET',
  headers:{
    'User-Agent':'github-activity-cli'
  }
}
// send request to github api
const req = https.request(options, (res) => {
  let data = '';

  console.log("Status Code:", res.statusCode);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const events = JSON.parse(data);

      console.log(`\nRecent GitHub activity for ${username} (fetched at ${new Date().toLocaleString()}):\n`);

      events.slice(0, 10).forEach((event) => {
        const type = event.type || "UnknownEvent";
        const repo = event.repo?.name || "unknown/repo";

        if (type === "PushEvent") {
          const commits = event.payload?.commits?.length || 0;
          console.log(`- Pushed ${commits} commit${commits !== 1 ? "s" : ""} to ${repo}`);
        }

        else if (type === "CreateEvent") {
          const refType = event.payload?.ref_type || "ref";
          console.log(`- Created ${refType} in ${repo}`);
        }

        else if (type === "IssuesEvent") {
          const action = event.payload?.action || "did something to";
          console.log(`- ${action.charAt(0).toUpperCase() + action.slice(1)} an issue in ${repo}`);
        }

        else if (type === "WatchEvent") {
          console.log(`- Starred ${repo}`);
        }

        else if (type === "ForkEvent") {
          console.log(`- Forked ${repo}`);
        }

        else {
          console.log(`- ${type} in ${repo}`);
        }
      });

    } catch (err) {
      console.error("Error parsing JSON response:", err.message);
    }
  });
});

req.on('error', (err) => {
  console.error("Error fetching data from GitHub API:", err.message);
});

req.end();


console.log("Request options prepared:", options);
// Further code to fetch and display GitHub activity would go here.