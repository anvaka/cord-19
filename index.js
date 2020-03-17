let fs = require('fs');

let path = require('path');
let graph = require('ngraph.graph')();
let toBinary = require('ngraph.tobinary');

let directories = [
  path.join(__dirname, '2020-03-13', 'biorxiv_medrxiv', 'biorxiv_medrxiv'),
  path.join(__dirname, '2020-03-13', 'comm_use_subset', 'comm_use_subset'),
  path.join(__dirname, '2020-03-13', 'noncomm_use_subset', 'noncomm_use_subset'),
  path.join(__dirname, '2020-03-13', 'pmc_custom_license', 'pmc_custom_license')
];

directories.forEach(dirPath => {
  let files = fs.readdirSync(dirPath)
  files.forEach(file => {
    let filePath = path.join(dirPath, file);
    let publication = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fromId = publication.metadata.title;
    graph.addNode(fromId);
    Object.values(publication.bib_entries).forEach(x => {
      let toId = x.title;
      if (!graph.hasLink(fromId, toId)) graph.addLink(fromId, toId);
    })
  })
});

toBinary(graph)
