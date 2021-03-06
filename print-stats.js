let fs = require('fs');
let centrality = require('ngraph.centrality');

let path = require('path');
let graph = require('ngraph.graph')();
let {directories, ignorePatterns} = require('./getSettings')();

directories.forEach(dirPath => {
  let files = fs.readdirSync(dirPath)
  files.forEach(file => {
    let filePath = path.join(dirPath, file);
    let publication = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fromId = publication.metadata.title;
    if (!fromId || fromId == 'Access to') {
      fromId = publication.paper_id; // bad input data - no title there. Use id instead.
    }
    graph.addNode(fromId);
    Object.values(publication.bib_entries).forEach(x => {
      let toId = x.title;
      for (let pattern of ignorePatterns) {
        // Again, bad data. Ignore.
        if (toId.match(pattern)) return;
      }

      if (!graph.hasLink(fromId, toId)) graph.addLink(fromId, toId);
    })
  })
});

var inCentrality = centrality.degree(graph, 'in');
printStats('Most cited', inCentrality);

var pagerank = require('ngraph.pagerank');
var rank = pagerank(graph);

printStats('Highest PageRank', rank);

// var outCentrality = centrality.degree(graph, 'out');
// printStats('Most citations', outCentrality);

function printStats(title, metrics, count = 100) {
  let sorted = Object.keys(metrics)
    .sort((a, b) => metrics[b] - metrics[a])
    .slice(0, count)
    .map((x, pos) => {
      return `${pos + 1}. [${x}](https://www.google.com/search?q=${encodeURIComponent(x)}) - ${metrics[x]}`;
    }).join('\n')

  console.log('')
  console.log('## ' + title)
  console.log('');
  console.log(sorted);
}