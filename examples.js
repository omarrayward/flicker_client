
const examples = [{
  givenAction: {
    name: 'INIT'
  },
  givenState: null,
  expectedState: {
    loadedImages: {},
    showOnlyFavorite: false,
    isLoading: false,
    favorited: {},
    pageCounter: 0
  }
},{
  givenAction: {
    name: 'BEGIN_IMAGE_FETCH'
  },
  expectedStateChange: {
    isLoading: true,
  }
},{
  givenAction: {
    name: 'END_IMAGE_FETCH',
    payload: [
      {
        id: '1',
        date_taken: '2000-01-01 00:00:00',
        author: 'King James',
        title: 'Slum dunk',
        src: 'http://www.slum.dunk'
      }
    ]
  },
  expectedStateChange: {
    loadedImages: {
      '1':{
        id: '1',
        date_taken: '2000-01-01 00:00:00',
        author: 'King James',
        title: 'Slum dunk',
        src: 'http://www.slum.dunk'
      }
    },
    isLoading: false,
    pageCounter: 1
  }
},{
  givenAction: {
    name: 'FAVORITE',
    payload: '1'
  },
  expectedStateChange: {
    favorited: {
      '1':{
        id: '1',
        date_taken: '2000-01-01 00:00:00',
        author: 'King James',
        title: 'Slum dunk',
        src: 'http://www.slum.dunk'
      }
    }
  }
},{
  givenAction: {
    name: 'UNFAVORITE',
    payload: '1'
  },
  givenState: {
    favorited: {
      '1':{
        id: '1',
        date_taken: '2000-01-01 00:00:00',
        author: 'King James',
        title: 'Slum dunk',
        src: 'http://www.slum.dunk'
      }
    },
  }
  expectedStateChange: {
    favorited: {}
  },
},{
  givenAction: {
    name: 'SHOW_FAVORITES'
  },
  expectedStateChange: {
    showOnlyFavorite: true
  },
},{
  givenAction: {
    name: 'SHOW_ALL'
  },
  expectedStateChange: {
    showOnlyFavorite: false
  }
},{
  givenAction: {
    name: 'LOAD',
    payload: {
      favorited: {
        '1':{
          id: '1',
          date_taken: '2000-01-01 00:00:00',
          author: 'King James',
          title: 'Slum dunk',
          src: 'http://www.slum.dunk'
        }
      },
      showOnlyFavorite: true
    }
  },
  givenState: null,
  expectedState: {
    loadedImages: {
      '1':{
        id: '1',
        date_taken: '2000-01-01 00:00:00',
        author: 'King James',
        title: 'Slum dunk',
        src: 'http://www.slum.dunk'
      }
    },
    showOnlyFavorite: true,
    isLoading: false,
    favorited: {
      '1':{
        id: '1',
        date_taken: '2000-01-01 00:00:00',
        author: 'King James',
        title: 'Slum dunk',
        src: 'http://www.slum.dunk'
      }
    }
  }
}]
