// Override Settings
var boostPFSInstantSearchConfig = {
  search: {
      //suggestionMode: 'test'
      //suggestionPosition: 'left',
      suggestionWidth: 300,
  }
};

(function () {
  BoostPFS.inject(this);

  // Customize style of Suggestion box
  SearchInput.prototype.customizeInstantSearch = function(suggestionElement, searchElement, searchBoxId) {
    if(!suggestionElement) suggestionElement = this.suggestionElement;
    if(!searchElement) searchElement = this.searchElement;
    if(!searchBoxId) searchBoxId = this.searchBoxId;
  };

  InstantSearch.prototype.beforeBindEvents = function(id) {
    if(!id) id = this.id;
      jQ(document).ready(function() {
          jQ(document).off('submit', '.search-form, #search-form');
      });
  };

})();