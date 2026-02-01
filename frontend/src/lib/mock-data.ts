// 'use client'; // This file should not be a client component itself, it's a data module.

export interface Artist {
  id: string;
  name: string;
  image: string;
  dataAiHint: string;
  bio?: string;
}

export interface Album {
  id: string;
  title: string;
  artistIds: string[]; // IDs of artists involved
  primaryArtistName: string; // For display convenience
  coverArt: string;
  dataAiHint: string;
  releaseYear?: number;
}

export interface Song {
  id: string;
  title: string;
  name: string; // Add for compatibility
  artistIds: string[];
  primaryArtistName: string;
  albumId: string;
  albumName: string;
  albumArt: string;
  dataAiHint: string;
  lyrics: {
    telugu: string;
    english: string;
  };
  duration?: string;
  image?: any[]; // Add for compatibility
  downloadUrl?: any[]; // Add for compatibility
  [key: string]: any;
}

export const artistsData: Artist[] = [
  { id: 'sid-sriram', name: 'Sid Sriram', image: 'https://placehold.co/300x300.png?text=Sid+Sriram', dataAiHint: 'singer portrait', bio: 'Sid Sriram is an Indian-American music producer, playback singer, and songwriter. He is a R&B songwriter and has been working in the Tamil, Telugu, Kannada, Malayalam, Hindi, Marathi and English music industries.' },
  { id: 'sp-balasubrahmanyam', name: 'S. P. Balasubrahmanyam', image: 'https://placehold.co/300x300.png?text=SPB', dataAiHint: 'singer portrait', bio: 'Sripathi Panditaradhyula Balasubrahmanyam, also known as SPB or Balu, was an Indian playback singer, television presenter, music director, actor, and film producer who worked predominantly in Telugu, Tamil, Kannada, Hindi, and Malayalam films.' },
  { id: 'ks-chithra', name: 'K. S. Chithra', image: 'https://placehold.co/300x300.png?text=Chithra', dataAiHint: 'singer portrait', bio: 'Krishnan Nair Shantakumari Chithra, often credited as K. S. Chithra or simply Chithra, is an Indian playback singer and Carnatic musician from Kerala.' },
  { id: 'ilaiyaraaja', name: 'Ilaiyaraaja', image: 'https://placehold.co/300x300.png?text=Ilaiyaraaja', dataAiHint: 'musician portrait', bio: 'Ilaiyaraaja is an Indian film composer, conductor-arranger, singer and lyricist who works in the Indian film industry, predominantly in Tamil cinema in addition to Telugu, Malayalam, Kannada and Hindi film director and screenwriter.' },
  { id: 'shreya-ghoshal', name: 'Shreya Ghoshal', image: 'https://placehold.co/300x300.png?text=Shreya', dataAiHint: 'singer portrait', bio: 'Shreya Ghoshal is an Indian singer. She has received four National Film Awards, seven Filmfare Awards including six for Best Female Playback Singer, nine Filmfare Awards South, three Kerala State Film Awards, two Tamil Nadu State Film Awards and many other awards.' },
  { id: 'armaan-malik', name: 'Armaan Malik', image: 'https://placehold.co/300x300.png?text=Armaan', dataAiHint: 'singer portrait', bio: 'Armaan Malik is an Indian singer, songwriter, record producer, voice-over, performer and actor. He is known for his singing in multiple languages, including Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Urdu, Kannada.'},
  { id: 'ram-miriyala', name: 'Ram Miriyala', image: 'https://placehold.co/300x300.png?text=Ram+Miriyala', dataAiHint: 'singer portrait', bio: 'Ram Miriyala is an Indian film music composer, singer, and lyricist known for his work in Telugu cinema.' },
  { id: 'ar-rahman', name: 'A. R. Rahman', image: 'https://placehold.co/300x300.png?text=AR+Rahman', dataAiHint: 'musician portrait', bio: 'Allah Rakha Rahman is an Indian composer, singer-songwriter, music producer, musician, multi-instrumentalist and philanthropist. Described as the world\'s most prominent and prolific film composer by Time, his works are notable for integrating Eastern classical music with electronic music sounds, world music genres and traditional orchestral arrangements.' },
];

export const albumsData: Album[] = [
  { id: 'ala-vaikunthapurramuloo', title: 'Ala Vaikunthapurramuloo', artistIds: ['sid-sriram', 'armaan-malik'], primaryArtistName: 'Thaman S', coverArt: 'https://placehold.co/400x400.png?text=Ala+Vaikunthapurramuloo', dataAiHint: 'movie poster cinematic', releaseYear: 2020 },
  { id: 'sashi', title: 'Sashi', artistIds: ['sid-sriram'], primaryArtistName: 'Arun Chiluveru', coverArt: 'https://placehold.co/400x400.png?text=Sashi', dataAiHint: 'movie poster romantic', releaseYear: 2021 },
  { id: 'geetha-govindam', title: 'Geetha Govindam', artistIds: ['sid-sriram'], primaryArtistName: 'Gopi Sundar', coverArt: 'https://placehold.co/400x400.png?text=Geetha+Govindam', dataAiHint: 'movie poster vibrant', releaseYear: 2018 },
  { id: 'varudu-kaavalenu', title: 'Varudu Kaavalenu', artistIds: ['sid-sriram'], primaryArtistName: 'Vishal Chandrasekhar', coverArt: 'https://placehold.co/400x400.png?text=Varudu+Kaavalenu', dataAiHint: 'movie poster elegant', releaseYear: 2021 },
  { id: 'most-eligible-bachelor', title: 'Most Eligible Bachelor', artistIds: ['sid-sriram'], primaryArtistName: 'Gopi Sundar', coverArt: 'https://placehold.co/400x400.png?text=MEB', dataAiHint: 'movie poster stylish', releaseYear: 2021 },
  { id: 'jathi-ratnalu', title: 'Jathi Ratnalu', artistIds: ['ram-miriyala'], primaryArtistName: 'Radhan', coverArt: 'https://placehold.co/400x400.png?text=Jathi+Ratnalu', dataAiHint: 'movie poster comedic', releaseYear: 2021 },
  { id: 'saahasam-swaasaga-saagipo', title: 'Saahasam Swaasaga Saagipo', artistIds: ['sid-sriram', 'ar-rahman'], primaryArtistName: 'A. R. Rahman', coverArt: 'https://placehold.co/400x400.png?text=SSS', dataAiHint: 'movie poster action', releaseYear: 2016 },
];

export const songsData: Song[] = [
  {
    id: 'samajavaragamana',
    title: 'Samajavaragamana',
    name: 'Samajavaragamana',
    artistIds: ['sid-sriram'], primaryArtistName: 'Sid Sriram',
    albumId: 'ala-vaikunthapurramuloo', albumName: 'Ala Vaikunthapurramuloo',
    albumArt: 'https://placehold.co/400x400.png?text=Samajavaragamana', dataAiHint: 'music album cinematic',
    lyrics: {
      telugu: `పల్లవి:
నీ కాళ్ళని పట్టుకు వదలనన్నవి చూడే నా కళ్ళు
ఆ చూపులనలా తొక్కుకు వెళ్ళకు దయలేదా అసలు (x2)
నీ కళ్ళకి కావలి కాస్తాయే కాటుకలా నా కలలు
నువ్వు నులుముతుంటేఎర్రగ కంది చిందేనే సెగలు
నా ఊపిరి గాలికి ఉయ్యాలలూగుతూ ముంగురులు నువ్వేగితే
నా గుండెల్లోన వయ్యారిహంసల నడకలు నువ్వేగితే (x2)
నీ కాళ్ళని పట్టుకు వదలనన్నవి చూడే నా కళ్ళు
ఆ చూపులనలా తొక్కుకు వెళ్ళకు దయలేదా అసలు

చరణం 1:
మబ్బుల దారాలతో మంచమేసే నేరుపే నీ సొగసు
మెరుపుల కాంతులతో మేనుదాచే మాయలే నీ వయసు
నీ చిరునవ్వులు తాకగానే తనువు మరిచిపోతినేమో
ఓ సిరివెన్నెల సీతక్కో నా ప్రాణాలే పోతాయేమో
పగడాల పెదవులతో పణమొత్తి కొరికేస్తే ఎంత మధురం ఓ ప్రియా
పరువాల పరుగులిక ఆపలేవుగా ఆగదె ఉద్రేకం
స్వర్గాలన్ని వదిలేసి నాకై వాలిన ఓ దేవకన్య
నీ కాళ్ళని పట్టుకు వదలనన్నవి చూడే నా కళ్ళు
ఆ చూపులనలా తొక్కుకు వెళ్ళకు దయలేదా అసలు`,
      english: `Pallavi:
Nee kallani pattuku vadalanannavi choode naa kallu
Aa choopulanalaa tokkuku vellaku dayaledhaa asalu (x2)
Nee kallaki kaavali kaastaaye kaatukalaa naa kalalu
Nuvvu nulumuthunte erraka kandi chindhene segalu
Naa oopiri gaaliki uyyaalalooguthu mungurulu nuvvegithe
Naa gundellona vayyaarihamsala nadakalu nuvvegithe (x2)
Nee kallani pattuku vadalanannavi choode naa kallu
Aa choopulanalaa tokkuku vellaku dayaledhaa asalu

Charanam 1:
Mabbula daaralatho manchamese nerupe nee sogasu
Merupula kaanthulatho menudaache maayale nee vayasu
Nee chirunavvulu thaakagaane thanuvu marichipothinemo
O sirivennela seethakko naa praanaale pothaayemo
Pagadaala pedhavulatho panamoththi korikesthe entha madhuram o priya
Paruvaala parugulika aapalevugaa aagadhe udrekam
Swargaalanni vadhilesi naakai vaalina o devakanya
Nee kallani pattuku vadalanannavi choode naa kallu
Aa choopulanalaa tokkuku vellaku dayaledhaa asalu`,
    },
    duration: '3:37',
    image: [],
    downloadUrl: [],
  },
  {
    id: 'buttabomma',
    title: 'ButtaBomma',
    name: 'ButtaBomma',
    artistIds: ['armaan-malik'], primaryArtistName: 'Armaan Malik',
    albumId: 'ala-vaikunthapurramuloo', albumName: 'Ala Vaikunthapurramuloo',
    albumArt: 'https://placehold.co/400x400.png?text=ButtaBomma', dataAiHint: 'music album energetic',
    lyrics: {
      telugu: `ఇంతకన్నా మంచి పోలికేది నాకు తట్టలేదుగానీ
అమ్ము ఈ ప్రేమలోకం లోని కమ్మనైన బొమ్మ అని నిన్నే ఇలా
అనగనగా ఒక ఊర్లో ఉంటె నీలాంటి పిల్ల
ఆ పిల్ల పేరు బుట్టబొమ్మ, అందరు అంటారు నన్నే అల్ల`,
      english: `Inthakanna manchi polikedhi naaku thattaledhugaani
Ammu ee premalokam loni kammanaina bomma ani ninne ila
Anaganaga oka oorlo unte neelaanti pilla
Aa pilla peru ButtaBomma, andharu antaaru nanne alla`,
    },
    duration: '3:18',
    image: [],
    downloadUrl: [],
  },
  { id: 'oke-oka-lokam', title: 'Oke Oka Lokam', name: 'Oke Oka Lokam', artistIds: ['sid-sriram'], primaryArtistName: 'Sid Sriram', albumId: 'sashi', albumName: 'Sashi', albumArt: 'https://placehold.co/400x400.png?text=OkeOkaLokam', dataAiHint: 'music album romantic', lyrics: { telugu: 'Placeholder Telugu Lyrics for Oke Oka Lokam...', english: 'Placeholder English Lyrics for Oke Oka Lokam...' }, duration: '4:02', image: [], downloadUrl: [] },
  { id: 'inkem-inkem-kaavaale', title: 'Inkem Inkem Kaavaale', name: 'Inkem Inkem Kaavaale', artistIds: ['sid-sriram'], primaryArtistName: 'Sid Sriram', albumId: 'geetha-govindam', albumName: 'Geetha Govindam', albumArt: 'https://placehold.co/400x400.png?text=InkemInkem', dataAiHint: 'music album soulful', lyrics: { telugu: 'Placeholder Telugu Lyrics for Inkem Inkem...', english: 'Placeholder English Lyrics for Inkem Inkem...' }, duration: '4:20', image: [], downloadUrl: [] },
  { id: 'kola-kalle-ilaa', title: 'Kola Kalle Ilaa', name: 'Kola Kalle Ilaa', artistIds: ['sid-sriram'], primaryArtistName: 'Sid Sriram', albumId: 'varudu-kaavalenu', albumName: 'Varudu Kaavalenu', albumArt: 'https://placehold.co/400x400.png?text=KolaKalle', dataAiHint: 'music album melodious', lyrics: { telugu: 'Placeholder Telugu Lyrics for Kola Kalle Ilaa...', english: 'Placeholder English Lyrics for Kola Kalle Ilaa...' }, duration: '3:50', image: [], downloadUrl: [] },
  { id: 'manasa-manasa', title: 'Manasa Manasa', name: 'Manasa Manasa', artistIds: ['sid-sriram'], primaryArtistName: 'Sid Sriram', albumId: 'most-eligible-bachelor', albumName: 'Most Eligible Bachelor', albumArt: 'https://placehold.co/400x400.png?text=ManasaManasa', dataAiHint: 'music notes vibrant', lyrics: { telugu: 'Placeholder Telugu Lyrics for Manasa Manasa...', english: 'Placeholder English Lyrics for Manasa Manasa...' }, duration: '4:11', image: [], downloadUrl: [] },
  { id: 'chitti', title: 'Chitti', name: 'Chitti', artistIds: ['ram-miriyala'], primaryArtistName: 'Ram Miriyala', albumId: 'jathi-ratnalu', albumName: 'Jathi Ratnalu', albumArt: 'https://placehold.co/400x400.png?text=Chitti', dataAiHint: 'abstract art fun', lyrics: { telugu: 'Placeholder Telugu Lyrics for Chitti...', english: 'Placeholder English Lyrics for Chitti...' }, duration: '3:05', image: [], downloadUrl: [] },
  { id: 'vellipomaakey-song', title: 'Vellipomaakey', name: 'Vellipomaakey', artistIds: ['sid-sriram', 'ar-rahman'], primaryArtistName: 'Sid Sriram, A. R. Rahman', albumId: 'saahasam-swaasaga-saagipo', albumName: 'Saahasam Swaasaga Saagipo', albumArt: 'https://placehold.co/400x400.png?text=Vellipomaakey', dataAiHint: 'music album cover emotional', lyrics: { telugu: 'Placeholder Telugu Lyrics for Vellipomaakey...', english: 'Placeholder English Lyrics for Vellipomaakey...' }, duration: '4:00', image: [], downloadUrl: [] },
];

// Helper functions
export function getArtistById(id: string): Artist | undefined {
  return artistsData.find(artist => artist.id === id);
}

export function getArtistsByIds(ids: string[]): Artist[] {
  return artistsData.filter(artist => ids.includes(artist.id));
}

export function getAlbumById(id: string): Album | undefined {
  return albumsData.find(album => album.id === id);
}

export function getSongById(id: string): Song | undefined {
  return songsData.find(song => song.id === id);
}

export function getSongsByArtistId(artistId: string): Song[] {
  return songsData.filter(song => song.artistIds.includes(artistId));
}

export function getSongsByAlbumId(albumId: string): Song[] {
  return songsData.filter(song => song.albumId === albumId);
}

export function getAlbumsByArtistId(artistId: string): Album[] {
  return albumsData.filter(album => album.artistIds.includes(artistId));
}

export function getAllSongs(): Song[] {
  return songsData;
}

export function getAllArtists(): Artist[] {
  return artistsData;
}

export function getAllAlbums(): Album[] {
  return albumsData;
}
