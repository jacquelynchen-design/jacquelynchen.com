export type MapsVisual = { id: string; src?: string; width: number; height: number };
export const mapsVisuals: MapsVisual[] = [
  {
    "id": "search",
    "src": "/assets/maps/img1SearchDefault1.png",
    "width": 2160,
    "height": 1536
  },
  {
    "id": "search-input",
    "src": "/assets/maps/img1SearchInput1.png",
    "width": 2160,
    "height": 1536
  },
  {
    "id": "solutions",
    "src": "/assets/maps/img2ResultsSolutions1.png",
    "width": 2160,
    "height": 1533
  },
  {
    "id": "train",
    "src": "/assets/maps/img2ResultsSolutions2.png",
    "width": 2160,
    "height": 2976
  },
  {
    "id": "taxi-1",
    "src": "/assets/maps/img2ResultsSolutions3.png",
    "width": 2160,
    "height": 1287
  },
  {
    "id": "taxi-2",
    "src": "/assets/maps/img2ResultsSolutions4.png",
    "width": 2160,
    "height": 1359
  },
  {
    "id": "recap",
    "src": "/assets/maps/img2ResultsSolutions5.png",
    "width": 2160,
    "height": 1767
  },
  {
    "id": "system",
    "src": "/assets/maps/img2ResultsSolutions6.png",
    "width": 2160,
    "height": 1536
  },
  {
    "id": "change-connection",
    "src": "/assets/maps/img1SearchModalDriver2.png",
    "width": 2160,
    "height": 1533
  },
  {
    "id": "map",
    "src": "/assets/maps/img1SearchModalDriver3.png",
    "width": 2160,
    "height": 1533
  },
  {
    "id": "map-zoom",
    "src": "/assets/maps/img1SearchModalDriver4.png",
    "width": 2160,
    "height": 1533
  },
  {
    "id": "driver",
    "src": "/assets/maps/img1SearchModalDriver1.png",
    "width": 2160,
    "height": 1536
  }
];
export const galleryIds = ['change-connection','map','map-zoom','driver'];
export const sectionIds = ['overview','problem','process','delivery','takeaways'] as const;
