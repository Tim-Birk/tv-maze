const NO_IMAGE_URL =
  "https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300";

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

/** Handle Episodes button click:
 *    - get list of matching episodes and show in episodes list inside of a modal
 */
$("#shows-list").on("click", "button", async function handleSearch(evt) {
  const id = $(evt.target).closest(".Show").attr("data-show-id");
  if (!id) return;

  const episodes = await getEpisodes(id);

  populateEpisodesModal(episodes);
});

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
const searchShows = async (query) => {
  // Make an ajax request to the searchShows api.
  try {
    const response = await axios.get(
      `http://api.tvmaze.com/search/shows?q=${query}`
    );
    const shows = response.data.map((item) => {
      const { id, name, summary, image } = item.show;
      return {
        id,
        name,
        summary,
        image: image ? image.original : NO_IMAGE_URL,
      };
    });

    return shows;
  } catch (err) {
    console.log(err);
    return [];
  }
};

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

const getEpisodes = async (id) => {
  // Get episodes from tvmaze
  try {
    const response = await axios.get(
      `http://api.tvmaze.com/shows/${id}/episodes`
    );

    const episodes = response.data.map((item) => {
      return ({ id, name, season, number } = item);
    });

    return episodes;
  } catch (err) {
    console.log(err);
    return [];
  }
};

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

const populateShows = (shows) => {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary" data-toggle="modal" data-target="#episodes-modal">Episodes</button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($item);
  }
};

/** Populate episodes modal:
 *     - given list of episodes, add episodes to modal and display in DOM
 */
const populateEpisodesModal = (episodes) => {
  $(".modal-body").empty();

  const episodeList = $("<ul>");

  for (let episode of episodes) {
    let $item = $(
      `<li data-episode-id="${episode.id}">
        Season ${episode.season}, Episode ${episode.number} - ${episode.name}
      </li>
      `
    );

    episodeList.append($item);
  }

  $(".modal-body").append(episodeList);
};
