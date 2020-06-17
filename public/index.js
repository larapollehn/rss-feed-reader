function getFeeds() {
    console.log('getFeeds');
    /**
     if(localStorage.getItem('feedUrl') === null){
        localStorage.setItem('feedUrl',JSON.stringify(['https://web.de/feeds/rss/magazine/news/index.rss']) );
        alert('No feeds yet, please add one.');
    } else {
     **/
    let feedUrls = JSON.parse(localStorage.getItem('feedUrl'));
    let firstUrl = feedUrls[0];
    axios({
        method: 'POST',
        url: '/api',
        data: {
            target: firstUrl
        }
    }).then((response) => {
        console.log('Success, Server Response', response.data);
    }).catch((error) => {
        console.log('Failure, Server Response', error.message);
    })

}

getFeeds();


/**
 let feedItems = [];

 feedItems.forEach(feed => {
    let card = document.createElement('div');
    card.classList.add('card');

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    let cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title')
    cardTitle.innerText = 'This is a Card Title'

    let cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.innerText = "fdskjflak fldjfl jdslf sfdlkj lfjsdkfj biadofueoij nfljvlasjfkh fljadslk kgjdh fl lfhdfvhljk  hdakvjhalfjlsajd khdfljakvjkjadhv ljdahghaldsjfdfgljfffjf kfj lkj lk fj f kjda lkjd fl fjfkj gldlk fgk d g";

    let pubDate = document.createElement('p');
    pubDate.classList.add('card-text');
    let mutedText = document.createElement('small');
    mutedText.classList.add('text-muted');
    mutedText.innerText = 'published 3min ago';
    pubDate.appendChild(mutedText);

    let link = document.createElement('a');
    link.href = '#';
    link.innerText = 'Read full article';

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(pubDate);
    cardBody.appendChild(link);

    card.appendChild(cardBody);

    document.getElementById('articles').appendChild(card);
})
 **/