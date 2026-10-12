import data from "./safari-data.json";
import { operatorTours } from "./operator-tours";
import hero from "@/assets/safari-hero.jpg";
import mara from "@/assets/mara.jpg";
import amboseli from "@/assets/amboseli.jpg";
import nakuru from "@/assets/nakuru.jpg";
const kenyaDestinationCopy: Record<string, { t: string; d: string; b?: string }> = {
  "maasai-mara": {
    t: "Big-cat country, open savannah and the Great Migration",
    d: "The Mara's rolling grasslands and acacia-dotted plains support an exceptional range of wildlife. Game drives bring opportunities to look for lions, leopards, cheetahs and elephants, while seasonal wildebeest movements add another remarkable chapter to the landscape.",
  },
  amboseli: {
    t: "Elephant country beneath Mount Kilimanjaro",
    d: "Amboseli is known for its large elephant herds and striking views of Mount Kilimanjaro. Open plains, acacia woodland and wetlands create varied habitats, making it a rewarding place for wildlife viewing and photography.",
  },
  nakuru: {
    t: "A Rift Valley lake framed by birdlife and rhino country",
    d: "Lake Nakuru National Park brings together lakeshore, woodland and open grassland in a compact Rift Valley setting. It is especially valued for its birdlife and protected populations of black and white rhinos, with viewpoints such as Baboon Cliff overlooking the lake.",
  },
  nairobi: {
    t: "A real wildlife safari on the edge of the city",
    d: "Nairobi National Park places open savannah and wildlife within sight of the city skyline. A visit can pair a game drive with nearby attractions such as the Giraffe Centre and the elephant orphanage, making it an easy start or finish to a Kenya journey.",
  },
  samburu: {
    t: "Northern Kenya wilderness and the Samburu Special Five",
    d: "Along the Ewaso Ng'iro River, Samburu's dry northern landscapes offer a distinct contrast to Kenya's southern savannah parks. Look for Grevy's zebra, reticulated giraffe, gerenuk and Beisa oryx among the region's characteristic wildlife.",
  },
  tsavo: {
    t: "A vast wilderness of red earth, rivers and open horizons",
    d: "Tsavo's enormous wilderness spans two national parks, from the open plains and Galana River of the east to the volcanic hills and springs of the west. The scale of the landscape, red-dust elephants and varied habitats make it a memorable safari region.",
  },
  mombasa: {
    t: "Swahili heritage, historic streets and Indian Ocean beaches",
    d: "Mombasa pairs a lively coastal city with a rich Swahili and maritime history. Explore the streets of Old Town and Fort Jesus, then unwind on nearby beaches or head out for a dhow trip and time on the water.",
  },
  naivasha: {
    t: "Freshwater lake escapes and active Rift Valley days",
    d: "Lake Naivasha offers a gentler pace between game drives, with boat trips among hippos and abundant birdlife. Nearby Crescent Island and Hell's Gate add opportunities for guided walks, cycling and scenic time in the Rift Valley.",
  },
  nanyuki: {
    t: "Highland scenery, equator stops and a gateway to Laikipia",
    d: "Nanyuki sits in Kenya's cool central highlands beneath Mount Kenya. It makes a natural base for exploring the equator, Ol Pejeta Conservancy and the wider Laikipia region, with mountain views and a relaxed small-town feel.",
  },
  "aberdare-ranges": {
    t: "Misty highland forests, moorland and waterfalls",
    d: "The Aberdare highlands shift from dense forest to open moorland, with steep valleys and waterfalls along the way. Forest lodges offer a distinctive style of wildlife viewing, often centred on waterholes visited by elephants and buffalo.",
  },
  "mount-kenya": {
    t: "Equatorial trekking from forest to alpine landscapes",
    d: "Mount Kenya rises through several distinct ecological zones, from forest and bamboo to high-altitude moorland and rocky peaks. Treks follow established routes through changing scenery, with alpine lakes and clear views on the mountain's upper slopes.",
  },
  "ol-pejeta": {
    t: "Laikipia conservation, wildlife and the equator",
    d: "Ol Pejeta Conservancy combines open Laikipia landscapes with a strong focus on wildlife protection. Visitors can look for rhinos and other plains game, learn about conservation work and visit the chimpanzee sanctuary, with the equator close by.",
  },
  diani: {
    t: "A white-sand Indian Ocean finish to a Kenya safari",
    d: "Diani Beach is an easy place to slow down after time in the bush. Its palm-lined coastline, warm Indian Ocean water and access to snorkelling and dhow trips make it a relaxed coastal extension to a Kenya itinerary.",
    b: "Dec-Mar; Jul-Oct",
  },
  "hells-gate": {
    t: "Rift Valley cliffs, gorges and outdoor adventure",
    d: "Set within the Great Rift Valley, Hell's Gate stands out for towering cliffs, water-carved gorges and geothermal features. The open terrain makes it especially suited to outdoor exploration, including hiking and cycling, alongside wildlife viewing.",
  },
  "lake-bogoria": {
    t: "Flamingo-lined waters and dramatic geothermal features",
    d: "Lake Bogoria is a striking Rift Valley reserve where alkaline lake shores, hot springs and geysers shape the landscape. Its birdlife can include large gatherings of flamingos, making it a memorable stop for nature lovers and photographers.",
  },
  "tsavo-east": {
    t: "Open arid plains, red elephants and the Galana River",
    d: "Tsavo East is a vast, open wilderness shaped by arid plains and the Galana River. Red-dust elephants, the Yatta Plateau and rugged river scenery give the park a strong sense of scale and a distinctive character.",
    b: "Jun-Oct; Jan-Feb",
  },
  "tsavo-west": {
    t: "Volcanic country, lava flows and the oasis of Mzima Springs",
    d: "Tsavo West's rugged scenery includes volcanic hills, the Shetani lava flows and the clear pools of Mzima Springs. The contrast between dry open country and spring-fed greenery creates varied wildlife-viewing opportunities throughout the park.",
    b: "Jun-Oct; Jan-Feb",
  },
};
const destinationIcons: Record<string, string> = {
  "ol-pejeta": "\u{1F98F}",
  diani: "\u{1F3D6}\u{FE0F}",
  "hells-gate": "\u{1F97E}",
  "lake-bogoria": "\u{1F9A9}",
  "tsavo-east": "\u{1F418}",
  "tsavo-west": "\u{1F30B}",
};
const extraDestinations = [
  {
    id: "ol-pejeta",
    n: "Ol Pejeta Conservancy",
    c: "Kenya",
    e: "🦏",
    h: 185,
    t: "A wildlife conservancy on the Laikipia Plateau",
    d: "Ol Pejeta Conservancy is a wildlife and conservation destination on Kenya’s Laikipia Plateau, visited on selected Bushbells safari itineraries.",
    b: "Year-round",
    l: [
      "Wildlife conservancy",
      "Chimpanzee sanctuary",
      "Equator stop",
      "Northern Kenya landscapes",
    ],
  },
  {
    id: "diani",
    n: "Diani Beach",
    c: "Kenya",
    e: "🏖️",
    h: 185,
    t: "A relaxing Indian Ocean beach extension",
    d: "Diani Beach offers a coastal finish to selected Kenya safari journeys, with time to unwind by the Indian Ocean.",
    b: "Dec–Mar; Jul–Oct",
    l: [
      "Indian Ocean coastline",
      "Beach stay",
      "Safari and coast combination",
      "Coastal relaxation",
    ],
  },
  {
    id: "hells-gate",
    n: "Hell's Gate National Park",
    c: "Kenya",
    e: "🥾",
    h: 170,
    t: "Rift Valley cliffs, gorges and adventure",
    d: "Set on the floor of the Great Rift Valley, Hell's Gate is known for dramatic cliffs, water-carved gorges and geothermal scenery. Its open landscapes are well suited to hiking, cycling and rock climbing.",
    b: "Year-round",
    l: [
      "Hiking and cycling trails",
      "Fischer's Tower",
      "Obsidian caves",
      "Geothermal scenery and wildlife",
    ],
  },
  {
    id: "lake-bogoria",
    n: "Lake Bogoria National Reserve",
    c: "Kenya",
    e: "🦩",
    h: 330,
    t: "Flamingos, hot springs and geysers",
    d: "A dramatic Rift Valley lake reserve where flocks of flamingos meet geothermal hot springs and geysers. It offers a striking change of scenery and excellent birdwatching.",
    b: "Year-round",
    l: ["Flamingos and other waterbirds", "Hot springs", "Geysers", "Rift Valley scenery"],
  },
  {
    id: "tsavo-east",
    n: "Tsavo East National Park",
    c: "Kenya",
    e: "🐘",
    h: 12,
    t: "Wide plains and red-dust elephants",
    d: "A vast, open wilderness of arid plains, riverine habitats and striking rock formations. Tsavo East is known for its red-dust elephants and expansive game-viewing landscapes.",
    b: "Jun–Oct; Jan–Feb",
    l: [
      "Red-dust elephants",
      "Galana River and Lugard Falls",
      "Yatta Plateau",
      "Wide, open wilderness",
    ],
  },
  {
    id: "tsavo-west",
    n: "Tsavo West National Park",
    c: "Kenya",
    e: "🌋",
    h: 12,
    t: "Volcanic landscapes and Mzima Springs",
    d: "A rugged park of volcanic hills, lava flows and natural springs. Tsavo West combines dramatic scenery with wildlife viewing around Mzima Springs and the park’s open plains.",
    b: "Jun–Oct; Jan–Feb",
    l: [
      "Mzima Springs",
      "Shetani lava flows",
      "Volcanic landscapes",
      "Elephants and other wildlife",
    ],
  },
];
export const destinations = [...data.destinations, ...extraDestinations].map((destination) => {
  const copy = kenyaDestinationCopy[destination.id];
  return destination.c === "Kenya" && copy
    ? {
        ...destination,
        ...copy,
        b: copy.b ?? destination.b,
        e: destinationIcons[destination.id] ?? destination.e,
      }
    : destination;
});
export const packages = operatorTours.slice().sort((a, b) => a.days - b.days);
export const { experiences, faq } = data;
export const images = { hero, mara, amboseli, nakuru };
const destinationPhotos: Record<string, string> = {
  "maasai-mara": mara,
  amboseli,
  nakuru,
  nairobi: hero,
  samburu: hero,
  tsavo: hero,
  "tsavo-east": hero,
  "tsavo-west": hero,
  mombasa: hero,
  naivasha: nakuru,
  nanyuki: amboseli,
  "aberdare-ranges": mara,
  "mount-kenya": amboseli,
  "ol-pejeta": mara,
  diani: hero,
  "hells-gate": nakuru,
  "lake-bogoria": nakuru,
  "murchison-falls-uganda": hero,
  "bwindi-national-park-uganda": hero,
  "kilimanjaro-tanzania": amboseli,
  "serengeti-tanzania": mara,
};
export const destinationImage = (id: string) => {
  const destination = destinations.find((item) => item.id === id);
  return (
    destinationPhotos[id] ??
    (destination && ["Kenya", "Uganda", "Tanzania"].includes(destination.c) ? hero : undefined)
  );
};
export const packageImage = (id: string, imageUrl?: string) =>
  imageUrl ?? (id.includes("nakuru")
    ? nakuru
    : id.includes("amboseli")
      ? amboseli
      : id.includes("nairobi")
        ? hero
      : mara);
export const whatsapp = (message = "Hello Bushbells Safaris, I’d like to plan a safari.") =>
  `https://wa.me/254723803116?text=${encodeURIComponent(message)}`;
export const pageHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} | Bushbells Safaris` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | Bushbells Safaris` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
