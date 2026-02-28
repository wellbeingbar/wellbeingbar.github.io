var _regionShapes = {
  // Roughly a wedge shape pointing south, wider at top (Red Sea left, Gulf right)
  'Arabian Peninsula': 'M8,6 L20,4 L36,6 L42,10 L44,18 L40,26 L34,34 L28,42 L24,48 L20,44 L16,36 L10,24 L6,16 Z',

  // Wide mainland with indent at top (Gulf of Carpentaria), bump bottom-right, Tasmania
  'Australia': 'M6,14 L14,10 L24,8 L34,10 L42,8 L46,12 L44,16 L46,20 L44,28 L40,34 L34,38 L26,40 L18,38 L10,34 L6,28 L4,22 Z M34,42 L40,40 L42,46 L36,46 Z',

  // Narrow isthmus connecting north to south, wider at top, thin in middle
  'Central America': 'M6,8 L18,4 L26,8 L22,14 L18,18 L16,22 L18,26 L22,30 L26,34 L30,38 L36,42 L42,46 L38,48 L30,44 L22,38 L16,32 L12,26 L10,20 L8,14 Z',

  // Wide horizontal rectangle-ish (steppes), wider east-west than north-south
  'Central Asia': 'M2,14 L12,10 L22,8 L34,6 L44,10 L48,16 L46,24 L42,30 L32,34 L20,36 L10,32 L4,26 L2,20 Z',

  // Blocky shape, slightly taller than wide
  'Central Europe': 'M10,8 L18,4 L30,4 L38,8 L42,14 L40,22 L36,30 L30,36 L20,38 L12,34 L6,26 L8,16 Z',

  // Large shape: wide north, narrower south, bump east (coast), indented west (Tibet plateau border)
  'China': 'M4,12 L12,6 L24,4 L36,4 L46,8 L48,16 L46,24 L44,32 L38,38 L30,42 L22,44 L16,42 L8,36 L4,28 L2,20 Z',

  // China + Korea + Japan region outline
  'East Asia': 'M2,10 L14,4 L28,2 L40,6 L48,14 L46,26 L42,36 L34,44 L22,46 L12,42 L6,34 L2,24 Z',

  // Eastern seaboard shape: wider at north (Great Lakes region), narrowing south to Florida
  'Eastern North America': 'M12,2 L26,2 L34,6 L38,14 L40,22 L38,30 L36,36 L40,42 L36,48 L30,46 L24,40 L18,34 L14,26 L10,18 L10,10 Z',

  // Iberian peninsula left, Scandinavian bump top-right, Italy boot bottom, UK top-left
  'Europe': 'M6,8 L10,4 L18,2 L28,2 L36,6 L42,4 L46,10 L44,18 L40,24 L44,30 L40,36 L32,40 L24,42 L18,36 L20,30 L14,28 L8,32 L4,26 L2,18 L4,12 Z',

  // Mountain range: arc shape, wider center, thin ends
  'Himalayas': 'M2,30 L6,22 L12,16 L20,12 L28,10 L36,12 L42,16 L46,22 L48,30 L44,34 L36,32 L28,28 L20,30 L12,32 L6,34 Z',

  // Triangle pointing south, wide at top (Himalayas), narrowing to tip (Kanyakumari)
  'India': 'M10,4 L22,2 L36,4 L40,10 L38,18 L34,26 L28,34 L25,44 L22,48 L20,42 L16,34 L12,26 L8,18 L6,10 Z',

  // India + Nepal/Bangladesh/Pakistan: wider version of India triangle
  'Indian subcontinent': 'M6,4 L16,2 L28,2 L40,4 L46,10 L44,18 L40,26 L34,34 L28,44 L24,48 L20,42 L14,32 L8,22 L4,14 L4,8 Z',

  // Archipelago: chain of islands stretching east-west (Sumatra, Java, Borneo, Sulawesi)
  'Indonesia': 'M2,16 L8,12 L16,14 L14,20 L8,22 L4,20 Z M18,20 L28,18 L36,20 L34,26 L24,28 L18,26 Z M38,10 L44,8 L48,14 L46,20 L40,18 Z M38,24 L42,22 L46,26 L44,32 L40,34 L36,30 Z',

  // Curved chain of 4 islands: Hokkaido (top), Honshu (long curve), Shikoku, Kyushu (bottom)
  'Japan': 'M30,2 L34,4 L36,8 L34,12 Z M24,10 L30,8 L34,14 L32,22 L28,30 L24,36 L20,40 L16,44 L14,40 L18,34 L22,26 L24,18 Z M14,36 L18,34 L20,38 L16,40 Z M10,40 L14,42 L16,46 L12,48 L8,46 Z',

  // Peninsula pointing south, slightly curved, wider at top
  'Korea': 'M14,4 L24,2 L34,4 L38,10 L36,16 L34,22 L30,30 L26,38 L22,44 L18,48 L16,42 L14,34 L12,26 L10,18 L12,10 Z',

  // Long narrow island, wider at north, tapering south
  'Madagascar': 'M22,2 L30,4 L34,10 L36,18 L36,28 L34,36 L30,44 L26,48 L22,46 L18,38 L16,28 L18,18 L20,10 Z',

  // Malay Peninsula (left, long thin) + Borneo chunk (right, blobby)
  'Malaysia': 'M4,8 L10,4 L14,8 L16,14 L14,22 L12,30 L10,38 L8,44 L4,40 L2,32 L2,20 Z M24,10 L34,6 L42,10 L46,18 L44,28 L38,34 L30,32 L24,24 L22,16 Z',

  // Scattered small islands (Spice Islands)
  'Maluku Islands (Indonesia)': 'M16,6 L22,4 L26,8 L24,14 L18,12 Z M30,10 L36,8 L40,14 L38,20 L32,18 Z M14,20 L20,18 L24,24 L20,30 L14,28 Z M28,26 L34,24 L38,30 L34,36 L28,34 Z M20,36 L26,34 L28,40 L24,46 L18,42 Z',

  // Elongated horizontal sea shape with coastlines
  'Mediterranean': 'M2,20 L8,16 L16,18 L22,14 L30,16 L38,14 L46,18 L48,24 L44,30 L36,28 L28,30 L20,28 L12,30 L6,28 L2,24 Z',

  // Irregular shape: Turkey at top, Iran right, Arabian Peninsula bottom-left
  'Middle East': 'M4,8 L16,4 L30,4 L42,8 L46,14 L44,22 L40,30 L34,38 L26,44 L18,42 L12,34 L8,26 L4,18 Z',

  // Wide horizontal shape (steppe), flat top and bottom, wider east-west
  'Mongolia': 'M4,14 L14,8 L26,6 L38,8 L46,14 L48,22 L44,30 L36,34 L24,36 L12,34 L4,28 L2,22 Z',

  // Long vertical shape, wider at top, narrow in middle, widening slightly at Irrawaddy delta
  'Myanmar': 'M14,2 L24,2 L32,6 L36,12 L34,18 L30,22 L28,16 L26,22 L28,28 L30,34 L28,42 L24,48 L20,46 L18,38 L16,30 L14,24 L16,16 L14,10 Z',

  // Wide horizontal strip (Sahara): wider east-west, flat shape
  'North Africa': 'M2,12 L12,8 L24,6 L36,6 L46,10 L48,18 L46,28 L40,36 L28,38 L16,38 L6,34 L2,26 Z',

  // Continental shape: wide at top (Canada), narrowing through US, thin Central America at bottom
  'North America': 'M4,4 L16,2 L28,2 L40,4 L48,10 L46,18 L44,26 L40,32 L36,38 L34,44 L30,48 L26,44 L22,38 L18,34 L14,30 L10,24 L6,18 L4,12 Z',

  // Wide shape (Russia/Siberia region) very wide east-west
  'Northern Asia': 'M2,12 L12,6 L26,4 L40,4 L48,10 L48,20 L46,28 L40,34 L28,38 L16,36 L6,30 L2,22 Z',

  // Scandinavian peninsula shape + Finland: elongated north-south with bump right
  'Northern Europe': 'M16,2 L24,4 L30,2 L36,6 L40,14 L38,24 L34,32 L28,38 L22,42 L16,40 L12,34 L8,26 L10,18 L12,10 Z',

  // Morocco/Algeria/Tunisia area: wider at east, coastal shape
  'Northwest Africa': 'M6,8 L18,4 L30,4 L40,8 L44,16 L42,26 L36,34 L26,40 L16,42 L8,38 L4,30 L2,20 L4,14 Z',

  // Scattered islands + Australia outline in miniature
  'Oceania': 'M4,12 L14,8 L24,10 L32,8 L40,12 L46,10 L48,16 L44,22 L38,20 L42,26 L40,32 L34,36 L26,38 L18,36 L12,32 L8,26 L6,20 Z M20,42 L26,40 L30,44 L24,48 Z',

  // Scattered small islands across wide area
  'Pacific Islands': 'M6,12 L12,10 L14,16 L8,16 Z M20,8 L26,6 L28,12 L22,14 Z M36,14 L42,12 L46,18 L40,20 Z M10,26 L16,24 L20,30 L14,32 Z M28,24 L34,22 L38,28 L32,30 Z M18,38 L24,36 L28,42 L22,44 Z M38,34 L44,32 L46,38 L40,40 Z',

  // Bird-shaped island: head left, body center, tail right (bird of paradise shape)
  'Papua New Guinea': 'M4,18 L12,12 L22,10 L32,12 L40,16 L46,14 L48,20 L46,26 L40,30 L32,32 L22,34 L14,32 L8,28 L4,24 Z M36,32 L42,34 L44,42 L38,44 L34,38 Z',

  // Very wide east-west (Russia), narrower south, flat top
  'Siberia': 'M2,10 L14,4 L28,2 L42,4 L48,8 L48,16 L46,24 L42,30 L34,36 L22,38 L12,36 L6,30 L2,22 Z',

  // Distinctive shape: wide at north (Brazil), narrowing south to Patagonia, bump east (Brazil), indent west
  'South America': 'M18,2 L30,2 L38,6 L42,14 L44,22 L42,30 L38,36 L34,42 L28,46 L22,48 L18,46 L16,40 L12,34 L10,26 L8,18 L10,10 L14,6 Z',

  // India + Pakistan + Bangladesh + Sri Lanka: wider Indian subcontinent
  'South Asia': 'M4,4 L16,2 L30,2 L42,6 L46,14 L44,22 L38,30 L32,38 L26,46 L22,48 L18,42 L12,32 L6,22 L2,14 L2,8 Z',

  // Indochina peninsula + island archipelago below
  'Southeast Asia': 'M8,2 L20,2 L32,4 L38,10 L42,8 L46,12 L44,20 L38,18 L34,24 L30,18 L26,24 L22,20 L18,28 L22,34 L28,38 L34,36 L40,32 L44,36 L42,42 L36,40 L28,44 L20,42 L14,36 L10,28 L6,20 L4,12 Z',

  // Narrowing toward south, Cape shape at bottom
  'Southern Africa': 'M12,2 L30,2 L40,6 L42,14 L40,24 L38,32 L34,40 L28,46 L22,48 L16,44 L10,36 L6,26 L4,16 L8,8 Z',

  // Mediterranean coastline: Italy boot, Iberian, Greek peninsulas
  'Southern Europe': 'M2,14 L8,8 L16,4 L26,4 L34,6 L42,10 L46,16 L44,22 L38,18 L34,24 L40,30 L36,36 L28,34 L22,30 L16,34 L12,30 L8,26 L4,22 Z',

  // Teardrop/pear shape island
  'Sri Lanka': 'M18,6 L28,4 L36,10 L40,18 L38,28 L34,36 L28,44 L22,48 L18,44 L14,36 L12,26 L14,16 Z',

  // Africa south of Sahara: wider at north (West Africa bulge), narrowing south
  'Sub-Saharan Africa': 'M10,2 L24,2 L36,4 L44,10 L46,20 L44,30 L40,38 L34,44 L26,48 L18,46 L10,40 L6,32 L4,22 L4,12 Z',

  // Elephant head shape: wider at top (north), narrow strip going south (Malay peninsula), slight bulge
  'Thailand': 'M12,2 L24,2 L34,6 L38,12 L36,18 L30,22 L26,18 L24,24 L26,30 L28,36 L30,42 L28,48 L24,46 L22,40 L20,34 L18,28 L16,22 L18,14 L16,8 Z',

  // Turkey + Iran + Levant + Arabian Peninsula outline
  'Western Asia': 'M4,6 L16,2 L30,4 L42,8 L46,16 L44,26 L38,36 L30,44 L20,42 L12,34 L6,24 L2,16 Z',

  // Small elongated island off East African coast
  'Zanzibar': 'M18,8 L28,4 L34,10 L36,20 L34,30 L30,38 L26,44 L22,48 L18,44 L16,36 L14,26 L15,16 Z'
};
