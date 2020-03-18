let path = require('path');

module.exports = function getSettings() {
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

  return {
    ignorePatterns: ignorePatterns,
    directories: directories
  }
}