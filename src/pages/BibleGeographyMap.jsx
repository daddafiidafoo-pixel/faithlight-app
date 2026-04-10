import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Search, BookOpen, X, ChevronRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Static Bible geography dataset ─────────────────────────────────────────
const BIBLE_PLACES = [
  { id: 'jerusalem', name: 'Jerusalem', lat: 31.7683, lng: 35.2137, region: 'Judea',
    desc: 'Holy city of Israel; site of the Temple, crucifixion, and resurrection.',
    verses: ['2 Samuel 5:6 – David captures Jerusalem', 'Luke 19:41 – Jesus weeps over Jerusalem', 'Acts 2:1 – Pentecost occurs in Jerusalem', 'Revelation 21:2 – New Jerusalem descends from heaven'] },
  { id: 'bethlehem', name: 'Bethlehem', lat: 31.7054, lng: 35.2024, region: 'Judea',
    desc: 'Birthplace of King David and Jesus Christ.',
    verses: ['Ruth 1:19 – Naomi returns to Bethlehem', 'Micah 5:2 – Prophecy of Messiah born in Bethlehem', 'Luke 2:4 – Jesus born in Bethlehem', 'Matthew 2:1 – Magi visit Bethlehem'] },
  { id: 'nazareth', name: 'Nazareth', lat: 32.6996, lng: 35.3035, region: 'Galilee',
    desc: 'Hometown of Jesus where He grew up.',
    verses: ['Luke 2:51 – Jesus returned to Nazareth', 'Matthew 13:54 – Jesus teaches in Nazareth synagogue', 'Luke 4:16 – Jesus reads Isaiah scroll in Nazareth', 'Mark 1:9 – Jesus came from Nazareth to be baptized'] },
  { id: 'galilee', name: 'Sea of Galilee', lat: 32.8208, lng: 35.5839, region: 'Galilee',
    desc: 'Where Jesus walked on water, calmed the storm, and called His disciples.',
    verses: ['Matthew 4:18 – Jesus calls Peter and Andrew', 'Matthew 14:25 – Jesus walks on water', 'Mark 4:39 – Jesus calms the storm', 'John 21:1 – Jesus appears at the Sea of Galilee after resurrection'] },
  { id: 'jordan', name: 'Jordan River', lat: 31.8441, lng: 35.5491, region: 'Jordan Valley',
    desc: 'Where John baptized and Jesus was baptized. Israel crossed into Canaan here.',
    verses: ['Joshua 3:17 – Israel crosses the Jordan', 'Matthew 3:13 – Jesus baptized by John', '2 Kings 5:14 – Naaman healed in the Jordan', 'Mark 1:5 – People baptized in the Jordan'] },
  { id: 'jericho', name: 'Jericho', lat: 31.8613, lng: 35.4541, region: 'Jordan Valley',
    desc: 'First city conquered in Canaan; walls fell at Joshua\'s command.',
    verses: ['Joshua 6:20 – Walls of Jericho fall', 'Luke 19:1 – Zacchaeus meets Jesus in Jericho', 'Mark 10:46 – Blind Bartimaeus healed near Jericho', 'Luke 10:30 – Good Samaritan parable begins on Jericho road'] },
  { id: 'sinai', name: 'Mount Sinai', lat: 28.5391, lng: 33.9750, region: 'Sinai Peninsula',
    desc: 'Where Moses received the Ten Commandments from God.',
    verses: ['Exodus 19:20 – God descends on Mount Sinai', 'Exodus 20:1 – Ten Commandments given', 'Exodus 34:4 – Moses returns to Mount Sinai', '1 Kings 19:8 – Elijah flees to Mount Horeb (Sinai)'] },
  { id: 'egypt', name: 'Egypt (Memphis)', lat: 29.8484, lng: 31.2508, region: 'Egypt',
    desc: 'Land of the Exodus; Joseph was sold here; holy family fled here.',
    verses: ['Genesis 37:28 – Joseph sold to Egypt', 'Exodus 12:41 – Israel leaves Egypt after 430 years', 'Matthew 2:13 – Holy family flees to Egypt', 'Acts 7:9 – Stephen recalls Joseph in Egypt'] },
  { id: 'babylon', name: 'Babylon', lat: 32.5361, lng: 44.4208, region: 'Mesopotamia',
    desc: 'Capital of the Neo-Babylonian Empire; site of Israel\'s exile.',
    verses: ['Daniel 1:1 – Daniel taken to Babylon', '2 Kings 24:14 – Jerusalem people exiled to Babylon', 'Psalm 137:1 – "By the rivers of Babylon we wept"', 'Revelation 17:5 – Babylon as symbol of evil'] },
  { id: 'corinth', name: 'Corinth', lat: 37.9074, lng: 22.8778, region: 'Greece',
    desc: 'Major Greek city; Paul planted a church here and wrote letters to.',
    verses: ['Acts 18:1 – Paul arrives in Corinth', '1 Corinthians 1:2 – Paul writes to Corinthian church', '2 Corinthians 1:1 – Second letter to Corinth', 'Acts 18:11 – Paul stayed 18 months in Corinth'] },
  { id: 'rome', name: 'Rome', lat: 41.9028, lng: 12.4964, region: 'Italy',
    desc: 'Capital of the Roman Empire; Paul wrote to the church here; Peter and Paul martyred here.',
    verses: ['Romans 1:7 – Paul writes to Rome', 'Acts 28:14 – Paul arrives in Rome', 'Philippians 4:22 – Saints in Caesar\'s household', '2 Timothy 4:6 – Paul writes from Rome before death'] },
  { id: 'antioch', name: 'Antioch (Syria)', lat: 36.2021, lng: 36.1597, region: 'Syria',
    desc: 'Where followers of Jesus were first called "Christians"; base for Paul\'s missionary journeys.',
    verses: ['Acts 11:26 – Disciples first called Christians in Antioch', 'Acts 13:1 – Paul and Barnabas sent out from Antioch', 'Galatians 2:11 – Paul confronts Peter in Antioch', 'Acts 14:26 – Paul returns to Antioch'] },
  { id: 'ephesus', name: 'Ephesus', lat: 37.9395, lng: 27.3408, region: 'Asia Minor',
    desc: 'Major city in Asia Minor; Paul ministered here 3 years; John lived here with Mary.',
    verses: ['Acts 19:1 – Paul arrives in Ephesus', 'Ephesians 1:1 – Letter to the Ephesian church', 'Revelation 2:1 – Letter to the church in Ephesus', 'Acts 19:19 – Sorcerers burn scrolls in Ephesus'] },
  { id: 'mount_of_olives', name: 'Mount of Olives', lat: 31.7762, lng: 35.2458, region: 'Judea',
    desc: 'Where Jesus prayed in Gethsemane, ascended to heaven, and will return.',
    verses: ['Matthew 26:36 – Jesus prays in Gethsemane', 'Acts 1:12 – Jesus ascends from Mount of Olives', 'Zechariah 14:4 – Mount of Olives splits at Second Coming', 'Luke 21:37 – Jesus taught on Mount of Olives'] },
  { id: 'bethany', name: 'Bethany', lat: 31.7686, lng: 35.2625, region: 'Judea',
    desc: 'Home of Mary, Martha, and Lazarus; where Jesus raised Lazarus.',
    verses: ['John 11:1 – Lazarus lives in Bethany', 'John 11:43 – Jesus raises Lazarus from the dead', 'Luke 10:38 – Jesus visits Mary and Martha', 'Luke 24:50 – Jesus blesses disciples near Bethany'] },
];

const REGIONS = ['All Regions', 'Judea', 'Galilee', 'Jordan Valley', 'Sinai Peninsula', 'Egypt', 'Mesopotamia', 'Greece', 'Italy', 'Syria', 'Asia Minor'];

// Custom colored marker
function createColoredIcon(color = '#4F46E5') {
  return L.divIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function MapFlyTo({ place }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.lat, place.lng], 9, { duration: 1.2 });
  }, [place]);
  return null;
}

export default function BibleGeographyMap() {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [passageQuery, setPassageQuery] = useState('');
  const [passagePlaces, setPassagePlaces] = useState([]);
  const [loadingPassage, setLoadingPassage] = useState(false);

  const filtered = BIBLE_PLACES.filter(p =>
    (selectedRegion === 'All Regions' || p.region === selectedRegion) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.region.toLowerCase().includes(search.toLowerCase()))
  );

  // AI-powered passage → location extraction
  const findPassageLocations = async () => {
    if (!passageQuery.trim()) return;
    setLoadingPassage(true);
    setPassagePlaces([]);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Given the Bible passage or chapter reference "${passageQuery}", list all geographical locations (cities, regions, mountains, rivers, seas) mentioned or strongly implied in this passage. Return ONLY location names that exist in the Ancient Near East or Mediterranean world. Return as a simple JSON array of strings, e.g. ["Jerusalem","Galilee"]. No explanations.`,
        response_json_schema: { type: 'object', properties: { locations: { type: 'array', items: { type: 'string' } } }, required: ['locations'] }
      });
      const locs = result?.locations || [];
      const found = BIBLE_PLACES.filter(p =>
        locs.some(l => p.name.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(p.name.toLowerCase()))
      );
      setPassagePlaces(found);
      if (found.length > 0) setSelectedPlace(found[0]);
    } catch {
      setPassagePlaces([]);
    }
    setLoadingPassage(false);
  };

  const displayPlaces = passagePlaces.length > 0 ? passagePlaces : filtered;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Bible Geography Map</h1>
            <p className="text-xs text-gray-500">Explore the historical Ancient Near East</p>
          </div>
        </div>

        {/* Passage finder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> View Locations for a Passage</p>
          <div className="flex gap-2">
            <Input value={passageQuery} onChange={e => setPassageQuery(e.target.value)}
              placeholder="e.g. Acts 13, John 4, Exodus 14…"
              onKeyDown={e => e.key === 'Enter' && findPassageLocations()}
              className="flex-1 text-sm" />
            <Button onClick={findPassageLocations} disabled={loadingPassage || !passageQuery.trim()} className="bg-indigo-700 gap-1.5 text-sm">
              {loadingPassage ? '...' : <><MapPin className="w-4 h-4" /> View</>}
            </Button>
          </div>
          {passagePlaces.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-xs text-gray-500">Found:</span>
              {passagePlaces.map(p => (
                <button key={p.id} onClick={() => setSelectedPlace(p)}
                  className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5 font-medium hover:bg-indigo-200 transition-colors">
                  📍 {p.name}
                </button>
              ))}
              <button onClick={() => { setPassagePlaces([]); setPassageQuery(''); }} className="text-xs text-gray-400 hover:text-gray-600 ml-1">Clear</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sidebar */}
          <div className="space-y-3">
            {/* Search + filter */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search places…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.slice(0, 6).map(r => (
                  <button key={r} onClick={() => setSelectedRegion(r)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${selectedRegion === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Places list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {displayPlaces.map(place => (
                  <button key={place.id} onClick={() => setSelectedPlace(place)}
                    className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center justify-between gap-2 ${selectedPlace?.id === place.id ? 'bg-indigo-50' : ''}`}>
                    <div>
                      <p className={`text-sm font-bold ${selectedPlace?.id === place.id ? 'text-indigo-700' : 'text-gray-900'}`}>📍 {place.name}</p>
                      <p className="text-xs text-gray-400">{place.region}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
                {displayPlaces.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No places found</p>}
              </div>
            </div>

            {/* Place detail */}
            {selectedPlace && (
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-extrabold text-gray-900">{selectedPlace.name}</h3>
                  <button onClick={() => setSelectedPlace(null)} className="text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>
                </div>
                <span className="inline-block text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 mb-2 font-medium">{selectedPlace.region}</span>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{selectedPlace.desc}</p>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Key Verses</p>
                  {selectedPlace.verses.map((v, i) => (
                    <div key={i} className="bg-amber-50 rounded-lg p-2 text-xs text-amber-900 border border-amber-100 leading-relaxed">
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '560px' }}>
              <MapContainer
                center={[31.5, 35.5]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© OpenStreetMap contributors'
                />
                {displayPlaces.map(place => (
                  <Marker
                    key={place.id}
                    position={[place.lat, place.lng]}
                    icon={createColoredIcon(selectedPlace?.id === place.id ? '#DC2626' : '#4F46E5')}
                    eventHandlers={{ click: () => setSelectedPlace(place) }}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-bold text-gray-900">{place.name}</p>
                        <p className="text-xs text-gray-500 mb-1">{place.region}</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{place.desc}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {selectedPlace && <MapFlyTo place={selectedPlace} />}
              </MapContainer>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">Map data © OpenStreetMap · Ancient Near East geography</p>
          </div>
        </div>
      </div>
    </div>
  );
}