// Smart Auto-Unit Detector for Farm Products (Supports English & Marathi)

export interface UnitSuggestion {
  unit: string;
  label: string;
  reason: string;
}

const UNIT_PATTERNS: { [key: string]: { unit: string; label: string; reason: string } } = {
  // Dozen items (डझन) - Bananas, Eggs, Oranges, Apples, Lemons, Roses
  banana: { unit: "dozen", label: "Dozen (डझन)", reason: "Bananas are traditionally sold by dozen" },
  केळी: { unit: "dozen", label: "Dozen (डझन)", reason: "केळी डझनाने विकली जातात" },
  केळ: { unit: "dozen", label: "Dozen (डझन)", reason: "केळी डझनाने विकली जातात" },
  egg: { unit: "dozen", label: "Dozen (डझन)", reason: "Eggs are usually counted by dozen or crate" },
  eggs: { unit: "dozen", label: "Dozen (डझन)", reason: "Eggs are usually counted by dozen" },
  अंडी: { unit: "dozen", label: "Dozen (डझन)", reason: "अंडी डझनाने मोजली जातात" },
  अंडे: { unit: "dozen", label: "Dozen (डझन)", reason: "अंडे डझनाने मोजली जातात" },
  orange: { unit: "dozen", label: "Dozen (डझन)", reason: "Oranges can be sold by dozen" },
  santra: { unit: "dozen", label: "Dozen (डझन)", reason: "Santra is sold by dozen" },
  संत्रे: { unit: "dozen", label: "Dozen (डझन)", reason: "संत्री डझनाने विकली जातात" },
  संत्री: { unit: "dozen", label: "Dozen (डझन)", reason: "संत्री डझनाने विकली जातात" },
  mosambi: { unit: "dozen", label: "Dozen (डझन)", reason: "Mosambi is sold by dozen" },
  मोसंबी: { unit: "dozen", label: "Dozen (डझन)", reason: "मोसंबी डझनाने विकली जातात" },
  apple: { unit: "dozen", label: "Dozen (डझन)", reason: "Apples can be sold by dozen or kg" },
  सफरचंद: { unit: "dozen", label: "Dozen (डझन)", reason: "सफरचंद डझनाने किंवा किलोने विकले जातात" },
  mango: { unit: "dozen", label: "Dozen (डझन)", reason: "Mangoes are prized by dozen / peti" },
  हापूस: { unit: "dozen", label: "Dozen (डझन)", reason: "हापूस आंबा डझनाने विकला जातो" },
  आंबा: { unit: "dozen", label: "Dozen (डझन)", reason: "आंबा डझनाने विकला जातो" },
  lemon: { unit: "dozen", label: "Dozen (डझन)", reason: "Lemons sold by dozen or piece" },
  लिंबू: { unit: "dozen", label: "Dozen (डझन)", reason: "लिंबू डझनाने विकले जातात" },
  rose: { unit: "dozen", label: "Dozen (डझन)", reason: "Roses sold by dozen" },
  गुलाब: { unit: "dozen", label: "Dozen (डझन)", reason: "गुलाब डझनाने विकले जातात" },

  // Bunch items (जुडी / पेंढी) - Leafy vegetables
  palak: { unit: "bunch", label: "Bunch (जुडी)", reason: "Leafy greens are sold in bunches (जुडी)" },
  spinach: { unit: "bunch", label: "Bunch (जुडी)", reason: "Spinach is tied in bunches" },
  पालक: { unit: "bunch", label: "Bunch (जुडी)", reason: "पालक जुडीने विकला जातो" },
  methi: { unit: "bunch", label: "Bunch (जुडी)", reason: "Fenugreek is sold in bunches (जुडी)" },
  fenugreek: { unit: "bunch", label: "Bunch (जुडी)", reason: "Fenugreek is sold in bunches" },
  मेथी: { unit: "bunch", label: "Bunch (जुडी)", reason: "मेथी जुडीने विकली जाते" },
  kothimbir: { unit: "bunch", label: "Bunch (जुडी)", reason: "Coriander is sold in bunches" },
  coriander: { unit: "bunch", label: "Bunch (जुडी)", reason: "Coriander is sold in bunches" },
  कोथिंबीर: { unit: "bunch", label: "Bunch (जुडी)", reason: "कोथिंबीर जुडीने विकली जाते" },
  shepu: { unit: "bunch", label: "Bunch (जुडी)", reason: "Shepu is sold in bunches" },
  शेपू: { unit: "bunch", label: "Bunch (जुडी)", reason: "शेपू जुडीने विकली जाते" },
  pudina: { unit: "bunch", label: "Bunch (जुडी)", reason: "Mint is sold in bunches" },
  mint: { unit: "bunch", label: "Bunch (जुडी)", reason: "Mint is sold in bunches" },
  पुदिना: { unit: "bunch", label: "Bunch (जुडी)", reason: "पुदिना जुडीने विकला जातो" },

  // Piece items (नग / piece)
  coconut: { unit: "piece", label: "Piece (नग)", reason: "Coconuts are sold per piece" },
  नारळ: { unit: "piece", label: "Piece (नग)", reason: "नारळ नगाने विकले जातात" },
  watermelon: { unit: "piece", label: "Piece (नग)", reason: "Watermelons sold per piece" },
  कलिंगड: { unit: "piece", label: "Piece (नग)", reason: "कलिंगड नगाने विकले जातात" },
  tarbuj: { unit: "piece", label: "Piece (नग)", reason: "Tarbuj is sold per piece" },
  muskmelon: { unit: "piece", label: "Piece (नग)", reason: "Muskmelon is sold per piece" },
  खरबूज: { unit: "piece", label: "Piece (नग)", reason: "खरबूज नगाने विकले जातात" },
  cabbage: { unit: "piece", label: "Piece (नग)", reason: "Cabbage can be sold per piece" },
  पत्ताकोबी: { unit: "piece", label: "Piece (नग)", reason: "पत्ताकोबी नगाने विकली जाते" },
  कोबी: { unit: "piece", label: "Piece (नग)", reason: "कोबी नगाने विकली जाते" },
  cauliflower: { unit: "piece", label: "Piece (नग)", reason: "Cauliflower sold per piece" },
  फ्लॉवर: { unit: "piece", label: "Piece (नग)", reason: "फ्लॉवर नगाने विकला जातो" },
  pumpkin: { unit: "piece", label: "Piece (नग)", reason: "Pumpkins sold per piece" },
  भोपळा: { unit: "piece", label: "Piece (नग)", reason: "भोपळा नगाने विकला जातो" },
  pineapple: { unit: "piece", label: "Piece (नग)", reason: "Pineapple sold per piece" },
  अननस: { unit: "piece", label: "Piece (नग)", reason: "अननस नगाने विकले जाते" },
  corn: { unit: "piece", label: "Piece (नग)", reason: "Sweet corn / Butta sold per piece" },
  मका: { unit: "piece", label: "Piece (नग)", reason: "मक्याचे कणीस नगाने विकले जाते" },

  // Litre items (लिटर)
  milk: { unit: "litre", label: "Litre (लिटर)", reason: "Milk and dairy liquids sold in litres" },
  दूध: { unit: "litre", label: "Litre (लिटर)", reason: "दूध लिटरने मोजले जाते" },
  oil: { unit: "litre", label: "Litre (लिटर)", reason: "Oils sold in litres" },
  तेल: { unit: "litre", label: "Litre (लिटर)", reason: "तेल लिटरने मोजले जाते" },
  ghee: { unit: "litre", label: "Litre (लिटर)", reason: "Ghee can be sold in litres/kg" },
  तूप: { unit: "litre", label: "Litre (लिटर)", reason: "तूप लिटर किंवा किलोने विकले जाते" },
  juice: { unit: "litre", label: "Litre (लिटर)", reason: "Juice sold in litres" },
  ताक: { unit: "litre", label: "Litre (लिटर)", reason: "ताक लिटरने मोजले जाते" },

  // Quintal items (क्विंटल)
  cotton: { unit: "quintal", label: "Quintal (क्विंटल)", reason: "Cash crops sold in quintals" },
  कापूस: { unit: "quintal", label: "Quintal (क्विंटल)", reason: "कापूस क्विंटलने विकला जातो" },
  soybean: { unit: "quintal", label: "Quintal (क्विंटल)", reason: "Soybean sold in quintals" },
  सोयाबीन: { unit: "quintal", label: "Quintal (क्विंटल)", reason: "सोयाबीन क्विंटलने विकले जाते" },
  sugarcane: { unit: "quintal", label: "Quintal (क्विंटल)", reason: "Sugarcane sold in tonnes/quintals" },
  ऊस: { unit: "quintal", label: "Quintal (क्विंटल)", reason: "ऊस क्विंटल/टनाने विकला जातो" },

  // Kilogram items (default for vegetables, grains, pulses)
  tomato: { unit: "kg", label: "Kilogram (किलो)", reason: "Tomatoes sold by weight in kg" },
  टोमॅटो: { unit: "kg", label: "Kilogram (किलो)", reason: "टोमॅटो किलोने विकले जातात" },
  potato: { unit: "kg", label: "Kilogram (किलो)", reason: "Potatoes sold by kg" },
  बटाटा: { unit: "kg", label: "Kilogram (किलो)", reason: "बटाटा किलोने विकला जातो" },
  onion: { unit: "kg", label: "Kilogram (किलो)", reason: "Onions sold by kg" },
  कांदा: { unit: "kg", label: "Kilogram (किलो)", reason: "कांदा किलोने विकला जातो" },
  wheat: { unit: "kg", label: "Kilogram (किलो)", reason: "Wheat grains sold by kg" },
  गहू: { unit: "kg", label: "Kilogram (किलो)", reason: "गहू किलोने विकले जातात" },
  rice: { unit: "kg", label: "Kilogram (किलो)", reason: "Rice sold by kg" },
  तांदूळ: { unit: "kg", label: "Kilogram (किलो)", reason: "तांदूळ किलोने विकले जातात" },
  dal: { unit: "kg", label: "Kilogram (किलो)", reason: "Pulses sold by kg" },
  डाळ: { unit: "kg", label: "Kilogram (किलो)", reason: "डाळ किलोने विकली जाते" },
  ginger: { unit: "kg", label: "Kilogram (किलो)", reason: "Ginger sold by kg" },
  आले: { unit: "kg", label: "Kilogram (किलो)", reason: "आले किलोने विकले जाते" },
  garlic: { unit: "kg", label: "Kilogram (किलो)", reason: "Garlic sold by kg" },
  लसूण: { unit: "kg", label: "Kilogram (किलो)", reason: "लसूण किलोने विकला जातो" },
  chilli: { unit: "kg", label: "Kilogram (किलो)", reason: "Chillies sold by kg" },
  मिरची: { unit: "kg", label: "Kilogram (किलो)", reason: "मिरची किलोने विकली जाते" },
  ladyfinger: { unit: "kg", label: "Kilogram (किलो)", reason: "Ladyfinger sold by kg" },
  भेंडी: { unit: "kg", label: "Kilogram (किलो)", reason: "भेंडी किलोने विकली जाते" },
  brinjal: { unit: "kg", label: "Kilogram (किलो)", reason: "Brinjal sold by kg" },
  वांगी: { unit: "kg", label: "Kilogram (किलो)", reason: "वांगी किलोने विकली जातात" },
};

export function detectUnitFromProductName(name: string): UnitSuggestion | null {
  if (!name || !name.trim()) return null;
  const clean = name.toLowerCase().trim();

  // 1. Direct match or keyword in string
  for (const [key, suggestion] of Object.entries(UNIT_PATTERNS)) {
    if (clean.includes(key)) {
      return suggestion;
    }
  }

  // 2. Default fallback based on common keywords
  if (clean.includes("oil") || clean.includes("liquid") || clean.includes("syrup")) {
    return { unit: "litre", label: "Litre (लिटर)", reason: "Liquid products default to Litres" };
  }

  return null;
}
