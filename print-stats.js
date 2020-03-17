let fs = require('fs');
let centrality = require('ngraph.centrality');

let path = require('path');
let graph = require('ngraph.graph')();

// references with these patterns are ignored during link construction
let ignorePatterns = [
  /Publisher's Note/,
  /This article is an open access article/,
  /Submit your next manuscript to BioMed Central/,
  /Springer Nature remains neutral/,
  /All rights reserved/,
  /who has granted medRxiv a license/,
  /Epub ahead of print/
]

let dataSetFolder = process.argv[2] || path.join(__dirname, '2020-03-13');

let directories = [
  path.join(dataSetFolder, 'biorxiv_medrxiv', 'biorxiv_medrxiv'),
  path.join(dataSetFolder, 'comm_use_subset', 'comm_use_subset'),
  path.join(dataSetFolder, 'noncomm_use_subset', 'noncomm_use_subset'),
  path.join(dataSetFolder, 'pmc_custom_license', 'pmc_custom_license')
];

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
// var layout = require('ngraph.offline.layout')(graph);
// console.log('Starting layout. This will take a while...');
// layout.run();
// console.log('Layout completed. Saving to binary format');
// save(graph, { outDir: './data' });
// console.log('Done.');