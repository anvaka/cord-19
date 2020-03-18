let fs = require('fs');

let path = require('path');
let graph = require('ngraph.graph')();
let save = require('ngraph.tobinary');

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

save(graph, { outDir: './data' });
var layout = require('ngraph.offline.layout')(graph);
console.log('Starting layout. This will take a while...');
layout.run();
console.log('Layout completed. Saving to binary format');
console.log('Done.');