"use client";

import { DatePickerInput } from "@mantine/dates";
import { 
  TextInput, 
  Group, 
  Button, 
  Stack, 
  Box, 
  Select, 
  Stepper, 
  Title,
  Text,
  Paper,
  Divider
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { CustomInputWrapper } from "../form/CustomInputWrapper";
import { BUSINESS_TYPES } from "@/utils/mileageUtils";
import { SubscriptionAlert } from "../subscription/SubscriptionAlert";
import { useState, useEffect } from "react";
import { 
  IconCheck, 
  IconCar, 
  IconCalendar, 
  IconRoute, 
  IconFileCheck,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";


interface MileageFormProps {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  vehicle: string;
  businessType: string;
  subscriptionStatus: string | null;
  onStartMileageChange: (value: string) => void;
  onEndMileageChange: (value: string) => void;
  onStartDateChange: (value: Date) => void;
  onEndDateChange: (value: Date) => void;
  onTotalPersonalMilesChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onBusinessTypeChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

interface FormValues {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  vehicle: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  businessType: string;
}

// Comprehensive vehicle makes and models - alphabetized for easier selection
const VEHICLE_MAKES = [
  { value: "acura", label: "Acura" },
  { value: "alfa-romeo", label: "Alfa Romeo" },
  { value: "aston-martin", label: "Aston Martin" },
  { value: "audi", label: "Audi" },
  { value: "bentley", label: "Bentley" },
  { value: "bmw", label: "BMW" },
  { value: "buick", label: "Buick" },
  { value: "cadillac", label: "Cadillac" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "chrysler", label: "Chrysler" },
  { value: "dodge", label: "Dodge" },
  { value: "ferrari", label: "Ferrari" },
  { value: "fiat", label: "Fiat" },
  { value: "ford", label: "Ford" },
  { value: "genesis", label: "Genesis" },
  { value: "gmc", label: "GMC" },
  { value: "honda", label: "Honda" },
  { value: "hyundai", label: "Hyundai" },
  { value: "infiniti", label: "Infiniti" },
  { value: "jaguar", label: "Jaguar" },
  { value: "jeep", label: "Jeep" },
  { value: "kia", label: "Kia" },
  { value: "lamborghini", label: "Lamborghini" },
  { value: "land-rover", label: "Land Rover" },
  { value: "lexus", label: "Lexus" },
  { value: "lincoln", label: "Lincoln" },
  { value: "maserati", label: "Maserati" },
  { value: "mazda", label: "Mazda" },
  { value: "mercedes", label: "Mercedes-Benz" },
  { value: "mini", label: "MINI" },
  { value: "mitsubishi", label: "Mitsubishi" },
  { value: "nissan", label: "Nissan" },
  { value: "porsche", label: "Porsche" },
  { value: "ram", label: "RAM" },
  { value: "rivian", label: "Rivian" },
  { value: "rolls-royce", label: "Rolls-Royce" },
  { value: "subaru", label: "Subaru" },
  { value: "tesla", label: "Tesla" },
  { value: "toyota", label: "Toyota" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "volvo", label: "Volvo" },
];

// Models by make - alphabetized for easier selection
const VEHICLE_MODELS: Record<string, { value: string; label: string }[]> = {
  acura: [
    { value: "ilx", label: "ILX" },
    { value: "integra", label: "Integra" },
    { value: "mdx", label: "MDX" },
    { value: "nsx", label: "NSX" },
    { value: "rdx", label: "RDX" },
    { value: "tlx", label: "TLX" },
  ],
  "alfa-romeo": [
    { value: "4c", label: "4C" },
    { value: "giulia", label: "Giulia" },
    { value: "stelvio", label: "Stelvio" },
    { value: "tonale", label: "Tonale" },
  ],
  "aston-martin": [
    { value: "db11", label: "DB11" },
    { value: "db12", label: "DB12" },
    { value: "dbx", label: "DBX" },
    { value: "vantage", label: "Vantage" },
  ],
  audi: [
    { value: "a3", label: "A3" },
    { value: "a4", label: "A4" },
    { value: "a5", label: "A5" },
    { value: "a6", label: "A6" },
    { value: "a7", label: "A7" },
    { value: "a8", label: "A8" },
    { value: "e-tron", label: "e-tron" },
    { value: "e-tron-gt", label: "e-tron GT" },
    { value: "q3", label: "Q3" },
    { value: "q4-e-tron", label: "Q4 e-tron" },
    { value: "q5", label: "Q5" },
    { value: "q7", label: "Q7" },
    { value: "q8", label: "Q8" },
    { value: "r8", label: "R8" },
    { value: "rs5", label: "RS5" },
    { value: "rs7", label: "RS7" },
    { value: "s4", label: "S4" },
    { value: "s5", label: "S5" },
    { value: "tt", label: "TT" },
  ],
  bentley: [
    { value: "bentayga", label: "Bentayga" },
    { value: "continental", label: "Continental" },
    { value: "flying-spur", label: "Flying Spur" },
  ],
  bmw: [
    { value: "1-series", label: "1 Series" },
    { value: "2-series", label: "2 Series" },
    { value: "3-series", label: "3 Series" },
    { value: "4-series", label: "4 Series" },
    { value: "5-series", label: "5 Series" },
    { value: "6-series", label: "6 Series" },
    { value: "7-series", label: "7 Series" },
    { value: "8-series", label: "8 Series" },
    { value: "i3", label: "i3" },
    { value: "i4", label: "i4" },
    { value: "i7", label: "i7" },
    { value: "i8", label: "i8" },
    { value: "ix", label: "iX" },
    { value: "m2", label: "M2" },
    { value: "m3", label: "M3" },
    { value: "m4", label: "M4" },
    { value: "m5", label: "M5" },
    { value: "m8", label: "M8" },
    { value: "x1", label: "X1" },
    { value: "x2", label: "X2" },
    { value: "x3", label: "X3" },
    { value: "x4", label: "X4" },
    { value: "x5", label: "X5" },
    { value: "x6", label: "X6" },
    { value: "x7", label: "X7" },
    { value: "z4", label: "Z4" },
  ],
  buick: [
    { value: "enclave", label: "Enclave" },
    { value: "encore", label: "Encore" },
    { value: "encore-gx", label: "Encore GX" },
    { value: "envision", label: "Envision" },
  ],
  cadillac: [
    { value: "ct4", label: "CT4" },
    { value: "ct5", label: "CT5" },
    { value: "escalade", label: "Escalade" },
    { value: "lyriq", label: "LYRIQ" },
    { value: "xt4", label: "XT4" },
    { value: "xt5", label: "XT5" },
    { value: "xt6", label: "XT6" },
  ],
  chevrolet: [
    { value: "blazer", label: "Blazer" },
    { value: "bolt", label: "Bolt" },
    { value: "camaro", label: "Camaro" },
    { value: "colorado", label: "Colorado" },
    { value: "corvette", label: "Corvette" },
    { value: "equinox", label: "Equinox" },
    { value: "malibu", label: "Malibu" },
    { value: "silverado", label: "Silverado" },
    { value: "spark", label: "Spark" },
    { value: "suburban", label: "Suburban" },
    { value: "tahoe", label: "Tahoe" },
    { value: "trailblazer", label: "Trailblazer" },
    { value: "traverse", label: "Traverse" },
    { value: "trax", label: "Trax" },
  ],
  chrysler: [
    { value: "300", label: "300" },
    { value: "pacifica", label: "Pacifica" },
  ],
  dodge: [
    { value: "challenger", label: "Challenger" },
    { value: "charger", label: "Charger" },
    { value: "durango", label: "Durango" },
    { value: "hornet", label: "Hornet" },
  ],
  ferrari: [
    { value: "296", label: "296" },
    { value: "812", label: "812" },
    { value: "f8", label: "F8" },
    { value: "portofino", label: "Portofino" },
    { value: "purosangue", label: "Purosangue" },
    { value: "roma", label: "Roma" },
    { value: "sf90", label: "SF90" },
  ],
  fiat: [
    { value: "500", label: "500" },
    { value: "500x", label: "500X" },
  ],
  ford: [
    { value: "bronco", label: "Bronco" },
    { value: "bronco-sport", label: "Bronco Sport" },
    { value: "edge", label: "Edge" },
    { value: "escape", label: "Escape" },
    { value: "expedition", label: "Expedition" },
    { value: "explorer", label: "Explorer" },
    { value: "f-150", label: "F-150" },
    { value: "f-250", label: "F-250" },
    { value: "f-350", label: "F-350" },
    { value: "maverick", label: "Maverick" },
    { value: "mustang", label: "Mustang" },
    { value: "mustang-mach-e", label: "Mustang Mach-E" },
    { value: "ranger", label: "Ranger" },
    { value: "transit", label: "Transit" },
  ],
  genesis: [
    { value: "g70", label: "G70" },
    { value: "g80", label: "G80" },
    { value: "g90", label: "G90" },
    { value: "gv60", label: "GV60" },
    { value: "gv70", label: "GV70" },
    { value: "gv80", label: "GV80" },
  ],
  gmc: [
    { value: "acadia", label: "Acadia" },
    { value: "canyon", label: "Canyon" },
    { value: "hummer-ev", label: "Hummer EV" },
    { value: "sierra", label: "Sierra" },
    { value: "terrain", label: "Terrain" },
    { value: "yukon", label: "Yukon" },
  ],
  honda: [
    { value: "accord", label: "Accord" },
    { value: "civic", label: "Civic" },
    { value: "cr-v", label: "CR-V" },
    { value: "hr-v", label: "HR-V" },
    { value: "odyssey", label: "Odyssey" },
    { value: "passport", label: "Passport" },
    { value: "pilot", label: "Pilot" },
    { value: "ridgeline", label: "Ridgeline" },
  ],
  hyundai: [
    { value: "elantra", label: "Elantra" },
    { value: "ioniq", label: "IONIQ" },
    { value: "ioniq-5", label: "IONIQ 5" },
    { value: "ioniq-6", label: "IONIQ 6" },
    { value: "kona", label: "Kona" },
    { value: "palisade", label: "Palisade" },
    { value: "santa-cruz", label: "Santa Cruz" },
    { value: "santa-fe", label: "Santa Fe" },
    { value: "sonata", label: "Sonata" },
    { value: "tucson", label: "Tucson" },
    { value: "venue", label: "Venue" },
  ],
  infiniti: [
    { value: "q50", label: "Q50" },
    { value: "q60", label: "Q60" },
    { value: "qx50", label: "QX50" },
    { value: "qx55", label: "QX55" },
    { value: "qx60", label: "QX60" },
    { value: "qx80", label: "QX80" },
  ],
  jaguar: [
    { value: "e-pace", label: "E-PACE" },
    { value: "f-pace", label: "F-PACE" },
    { value: "f-type", label: "F-TYPE" },
    { value: "i-pace", label: "I-PACE" },
    { value: "xe", label: "XE" },
    { value: "xf", label: "XF" },
  ],
  jeep: [
    { value: "cherokee", label: "Cherokee" },
    { value: "compass", label: "Compass" },
    { value: "gladiator", label: "Gladiator" },
    { value: "grand-cherokee", label: "Grand Cherokee" },
    { value: "renegade", label: "Renegade" },
    { value: "wagoneer", label: "Wagoneer" },
    { value: "wrangler", label: "Wrangler" },
  ],
  kia: [
    { value: "carnival", label: "Carnival" },
    { value: "ev6", label: "EV6" },
    { value: "ev9", label: "EV9" },
    { value: "forte", label: "Forte" },
    { value: "k5", label: "K5" },
    { value: "niro", label: "Niro" },
    { value: "rio", label: "Rio" },
    { value: "seltos", label: "Seltos" },
    { value: "sorento", label: "Sorento" },
    { value: "soul", label: "Soul" },
    { value: "sportage", label: "Sportage" },
    { value: "stinger", label: "Stinger" },
    { value: "telluride", label: "Telluride" },
  ],
  lamborghini: [
    { value: "aventador", label: "Aventador" },
    { value: "huracan", label: "Huracán" },
    { value: "revuelto", label: "Revuelto" },
    { value: "urus", label: "Urus" },
  ],
  "land-rover": [
    { value: "defender", label: "Defender" },
    { value: "discovery", label: "Discovery" },
    { value: "discovery-sport", label: "Discovery Sport" },
    { value: "range-rover", label: "Range Rover" },
    { value: "range-rover-evoque", label: "Range Rover Evoque" },
    { value: "range-rover-sport", label: "Range Rover Sport" },
    { value: "range-rover-velar", label: "Range Rover Velar" },
  ],
  lexus: [
    { value: "es", label: "ES" },
    { value: "gx", label: "GX" },
    { value: "is", label: "IS" },
    { value: "lc", label: "LC" },
    { value: "ls", label: "LS" },
    { value: "lx", label: "LX" },
    { value: "nx", label: "NX" },
    { value: "rc", label: "RC" },
    { value: "rx", label: "RX" },
    { value: "rz", label: "RZ" },
    { value: "tx", label: "TX" },
    { value: "ux", label: "UX" },
  ],
  lincoln: [
    { value: "aviator", label: "Aviator" },
    { value: "corsair", label: "Corsair" },
    { value: "nautilus", label: "Nautilus" },
    { value: "navigator", label: "Navigator" },
  ],
  maserati: [
    { value: "ghibli", label: "Ghibli" },
    { value: "grecale", label: "Grecale" },
    { value: "levante", label: "Levante" },
    { value: "mc20", label: "MC20" },
    { value: "quattroporte", label: "Quattroporte" },
  ],
  mazda: [
    { value: "cx-30", label: "CX-30" },
    { value: "cx-5", label: "CX-5" },
    { value: "cx-50", label: "CX-50" },
    { value: "cx-9", label: "CX-9" },
    { value: "cx-90", label: "CX-90" },
    { value: "mazda3", label: "Mazda3" },
    { value: "mazda6", label: "Mazda6" },
    { value: "mx-5", label: "MX-5 Miata" },
  ],
  mercedes: [
    { value: "a-class", label: "A-Class" },
    { value: "amg-gt", label: "AMG GT" },
    { value: "c-class", label: "C-Class" },
    { value: "cla", label: "CLA" },
    { value: "cls", label: "CLS" },
    { value: "e-class", label: "E-Class" },
    { value: "eqs", label: "EQS" },
    { value: "g-class", label: "G-Class" },
    { value: "gla", label: "GLA" },
    { value: "glb", label: "GLB" },
    { value: "glc", label: "GLC" },
    { value: "gle", label: "GLE" },
    { value: "gls", label: "GLS" },
    { value: "s-class", label: "S-Class" },
    { value: "sl", label: "SL" },
  ],
  mini: [
    { value: "clubman", label: "Clubman" },
    { value: "convertible", label: "Convertible" },
    { value: "countryman", label: "Countryman" },
    { value: "hardtop", label: "Hardtop" },
  ],
  mitsubishi: [
    { value: "eclipse-cross", label: "Eclipse Cross" },
    { value: "mirage", label: "Mirage" },
    { value: "outlander", label: "Outlander" },
    { value: "outlander-sport", label: "Outlander Sport" },
  ],
  nissan: [
    { value: "altima", label: "Altima" },
    { value: "ariya", label: "Ariya" },
    { value: "armada", label: "Armada" },
    { value: "frontier", label: "Frontier" },
    { value: "kicks", label: "Kicks" },
    { value: "leaf", label: "LEAF" },
    { value: "maxima", label: "Maxima" },
    { value: "murano", label: "Murano" },
    { value: "pathfinder", label: "Pathfinder" },
    { value: "rogue", label: "Rogue" },
    { value: "sentra", label: "Sentra" },
    { value: "titan", label: "Titan" },
    { value: "versa", label: "Versa" },
    { value: "z", label: "Z" },
  ],
  porsche: [
    { value: "718", label: "718" },
    { value: "911", label: "911" },
    { value: "cayenne", label: "Cayenne" },
    { value: "macan", label: "Macan" },
    { value: "panamera", label: "Panamera" },
    { value: "taycan", label: "Taycan" },
  ],
  ram: [
    { value: "1500", label: "1500" },
    { value: "2500", label: "2500" },
    { value: "3500", label: "3500" },
    { value: "promaster", label: "ProMaster" },
  ],
  rivian: [
    { value: "r1s", label: "R1S" },
    { value: "r1t", label: "R1T" },
  ],
  "rolls-royce": [
    { value: "cullinan", label: "Cullinan" },
    { value: "ghost", label: "Ghost" },
    { value: "phantom", label: "Phantom" },
    { value: "spectre", label: "Spectre" },
  ],
  subaru: [
    { value: "ascent", label: "Ascent" },
    { value: "brz", label: "BRZ" },
    { value: "crosstrek", label: "Crosstrek" },
    { value: "forester", label: "Forester" },
    { value: "impreza", label: "Impreza" },
    { value: "legacy", label: "Legacy" },
    { value: "outback", label: "Outback" },
    { value: "solterra", label: "Solterra" },
    { value: "wrx", label: "WRX" },
  ],
  tesla: [
    { value: "cybertruck", label: "Cybertruck" },
    { value: "model-3", label: "Model 3" },
    { value: "model-s", label: "Model S" },
    { value: "model-x", label: "Model X" },
    { value: "model-y", label: "Model Y" },
    { value: "roadster", label: "Roadster" },
  ],
  toyota: [
    { value: "4runner", label: "4Runner" },
    { value: "avalon", label: "Avalon" },
    { value: "bz4x", label: "bZ4X" },
    { value: "camry", label: "Camry" },
    { value: "corolla", label: "Corolla" },
    { value: "corolla-cross", label: "Corolla Cross" },
    { value: "crown", label: "Crown" },
    { value: "gr86", label: "GR86" },
    { value: "gr-corolla", label: "GR Corolla" },
    { value: "gr-supra", label: "GR Supra" },
    { value: "highlander", label: "Highlander" },
    { value: "land-cruiser", label: "Land Cruiser" },
    { value: "mirai", label: "Mirai" },
    { value: "prius", label: "Prius" },
    { value: "rav4", label: "RAV4" },
    { value: "sequoia", label: "Sequoia" },
    { value: "sienna", label: "Sienna" },
    { value: "tacoma", label: "Tacoma" },
    { value: "tundra", label: "Tundra" },
    { value: "venza", label: "Venza" },
  ],
  volkswagen: [
    { value: "arteon", label: "Arteon" },
    { value: "atlas", label: "Atlas" },
    { value: "atlas-cross-sport", label: "Atlas Cross Sport" },
    { value: "golf-gti", label: "Golf GTI" },
    { value: "golf-r", label: "Golf R" },
    { value: "id4", label: "ID.4" },
    { value: "jetta", label: "Jetta" },
    { value: "taos", label: "Taos" },
    { value: "tiguan", label: "Tiguan" },
  ],
  volvo: [
    { value: "c40", label: "C40" },
    { value: "ex30", label: "EX30" },
    { value: "ex90", label: "EX90" },
    { value: "s60", label: "S60" },
    { value: "s90", label: "S90" },
    { value: "v60", label: "V60" },
    { value: "v90", label: "V90" },
    { value: "xc40", label: "XC40" },
    { value: "xc60", label: "XC60" },
    { value: "xc90", label: "XC90" },
  ],
};

// Generate years (current year down to 1990)
const VEHICLE_YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

export function MileageForm({
  startMileage,
  endMileage,
  startDate,
  endDate,
  totalPersonalMiles,
  vehicle,
  businessType,
  subscriptionStatus,
  onStartMileageChange,
  onEndMileageChange,
  onStartDateChange,
  onEndDateChange,
  onTotalPersonalMilesChange,
  onVehicleChange,
  onBusinessTypeChange,
  onGenerate,
  onReset,
}: MileageFormProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeStep, setActiveStep] = useState(0);
  
  // Parse existing vehicle string into make, model, year if possible
  const parseVehicle = (vehicleStr: string): { make: string; model: string; year: string } => {
    // Try to match pattern like "2022 Toyota Camry"
    const match = vehicleStr.match(/(\d{4})\s+([\w-]+)\s+([\w-]+)/);
    if (match) {
      const [, year, make, model] = match;
      return { year, make: make.toLowerCase(), model: model.toLowerCase() };
    }
    return { make: "", model: "", year: "" };
  };
  
  // Initial vehicle parts
  const initialVehicle = parseVehicle(vehicle);
  
  // State for vehicle parts
  const [vehicleMake, setVehicleMake] = useState(initialVehicle.make);
  const [vehicleModel, setVehicleModel] = useState(initialVehicle.model);
  const [vehicleYear, setVehicleYear] = useState(initialVehicle.year);
  
  // Available models based on selected make
  const [availableModels, setAvailableModels] = useState<{ value: string; label: string }[]>(
    vehicleMake && VEHICLE_MODELS[vehicleMake] ? VEHICLE_MODELS[vehicleMake] : []
  );
  
  // Update available models when make changes
  useEffect(() => {
    if (vehicleMake && VEHICLE_MODELS[vehicleMake]) {
      setAvailableModels(VEHICLE_MODELS[vehicleMake]);
    } else {
      setAvailableModels([]);
    }
  }, [vehicleMake]);
  
  // Update the vehicle string when any part changes
  useEffect(() => {
    if (vehicleMake && vehicleModel && vehicleYear) {
      // Find the display labels
      const makeLabel = VEHICLE_MAKES.find(m => m.value === vehicleMake)?.label || '';
      const modelLabel = availableModels.find(m => m.value === vehicleModel)?.label || '';
      
      // Format the vehicle string: "2022 Toyota Camry"
      const vehicleString = `${vehicleYear} ${makeLabel} ${modelLabel}`.trim();
      
      if (vehicleString.split(' ').length >= 3) {
        onVehicleChange(vehicleString);
      }
    }
  }, [vehicleMake, vehicleModel, vehicleYear, availableModels, onVehicleChange]);
  
  // Handle make selection
  const handleMakeChange = (value: string | null) => {
    const newMake = value || '';
    setVehicleMake(newMake);
    setVehicleModel(''); // Reset model when make changes
  };
  
  // Handle model selection
  const handleModelChange = (value: string | null) => {
    setVehicleModel(value || '');
  };
  
  // Handle year selection
  const handleYearChange = (value: string | null) => {
    setVehicleYear(value || '');
  };
  
  // Create business type options for the select dropdown
  const businessTypeOptions = BUSINESS_TYPES.map((type) => ({
    value: type.name,
    label: type.name,
  }));

  const form = useForm<FormValues>({
    initialValues: {
      startMileage: startMileage,
      endMileage: endMileage,
      startDate: startDate,
      endDate: endDate,
      totalPersonalMiles: totalPersonalMiles,
      vehicle: vehicle,
      vehicleMake: vehicleMake,
      vehicleModel: vehicleModel,
      vehicleYear: vehicleYear,
      businessType: businessType,
    },
    validate: {
      startMileage: (value) => (value ? null : "Start mileage is required"),
      endMileage: (value, values) =>
        value
          ? parseInt(value) <= parseInt(values.startMileage)
            ? "End mileage must be greater than start mileage"
            : null
          : "End mileage is required",
      startDate: (value) => (value ? null : "Start date is required"),
      endDate: (value, values) =>
        value
          ? new Date(value) < new Date(values.startDate)
            ? "End date must be after start date"
            : null
          : "End date is required",
      totalPersonalMiles: (value, values) => {
        const totalMiles =
          parseInt(values.endMileage) - parseInt(values.startMileage);
        return value !== undefined && value !== null
          ? parseInt(value) > totalMiles
            ? `Personal miles cannot exceed total miles (${totalMiles})`
            : null
          : "Personal miles is required";
      },
      vehicleMake: (value) => (value ? null : "Vehicle make is required"),
      vehicleModel: (value) => (value ? null : "Vehicle model is required"),
      vehicleYear: (value) => (value ? null : "Vehicle year is required"),
      businessType: (value) => (value ? null : "Business type is required"),
    },
  });

  // Handle date changes separately since they're not string values
  const handleStartDateChange = (date: Date) => {
    form.setFieldValue("startDate", date);
    onStartDateChange(date);
  };

  const handleEndDateChange = (date: Date) => {
    form.setFieldValue("endDate", date);
    onEndDateChange(date);
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      onGenerate();
    }
  };

  const handleReset = () => {
    form.reset();
    onReset();
    setActiveStep(0);
  };

  // Step validation functions
  const validateVehicleStep = () => {
    const startMileageError = form.validateField('startMileage').error;
    const endMileageError = form.validateField('endMileage').error;
    const vehicleMakeError = form.validateField('vehicleMake').error;
    const vehicleModelError = form.validateField('vehicleModel').error;
    const vehicleYearError = form.validateField('vehicleYear').error;
    
    return !startMileageError && !endMileageError && !vehicleMakeError && !vehicleModelError && !vehicleYearError;
  };

  const validateDateStep = () => {
    // Date fields are always valid since they have default values
    return true;
  };

  const validateTripDetailsStep = () => {
    const personalMilesError = form.validateField('totalPersonalMiles').error;
    const businessTypeError = form.validateField('businessType').error;
    
    return !personalMilesError && !businessTypeError;
  };

  const nextStep = () => {
    if (activeStep === 0 && !validateVehicleStep()) {
      return;
    } else if (activeStep === 1 && !validateDateStep()) {
      return;
    } else if (activeStep === 2 && !validateTripDetailsStep()) {
      return;
    }
    
    setActiveStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  // Calculate total miles and business miles
  const totalMiles = parseInt(form.values.endMileage) - parseInt(form.values.startMileage) || 0;
  const businessMiles = totalMiles - (parseInt(form.values.totalPersonalMiles) || 0);

  return (
    <Box p="md">
      {subscriptionStatus !== "active" && <SubscriptionAlert mb="md" />}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Paper p="md" radius="md" withBorder mb="lg">
          <Stepper active={activeStep} onStepClick={setActiveStep}>
            <Stepper.Step
              label="Vehicle Information"
              description="Odometer readings"
              icon={<IconCar size={18} />}
              allowStepSelect={activeStep > 0}
            >
              <Box mt="md">
                <Title order={3} size="h4" mb="md">Vehicle Information</Title>
                <Text c="dimmed" mb="lg">Enter your vehicle details and odometer readings</Text>
                
                <Stack gap="md">
                  {isMobile ? (
                    <Stack>
                      <CustomInputWrapper
                        label="Starting Odometer Reading"
                        required
                        error={form.errors.startMileage}
                      >
                        <TextInput
                          placeholder="Enter starting mileage"
                          {...form.getInputProps("startMileage")}
                          onChange={(e) => {
                            form.setFieldValue("startMileage", e.target.value);
                            onStartMileageChange(e.target.value);
                          }}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                      <CustomInputWrapper
                        label="Ending Odometer Reading"
                        required
                        error={form.errors.endMileage}
                      >
                        <TextInput
                          placeholder="Enter ending mileage"
                          {...form.getInputProps("endMileage")}
                          onChange={(e) => {
                            form.setFieldValue("endMileage", e.target.value);
                            onEndMileageChange(e.target.value);
                          }}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                    </Stack>
                  ) : (
                    <Group grow>
                      <CustomInputWrapper
                        label="Starting Odometer Reading"
                        required
                        error={form.errors.startMileage}
                      >
                        <TextInput
                          placeholder="Enter starting mileage"
                          {...form.getInputProps("startMileage")}
                          onChange={(e) => {
                            form.setFieldValue("startMileage", e.target.value);
                            onStartMileageChange(e.target.value);
                          }}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                      <CustomInputWrapper
                        label="Ending Odometer Reading"
                        required
                        error={form.errors.endMileage}
                      >
                        <TextInput
                          placeholder="Enter ending mileage"
                          {...form.getInputProps("endMileage")}
                          onChange={(e) => {
                            form.setFieldValue("endMileage", e.target.value);
                            onEndMileageChange(e.target.value);
                          }}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                    </Group>
                  )}
                  
                  <Stack gap="md">
                    <CustomInputWrapper
                      label="Vehicle Make"
                      required
                      error={form.errors.vehicleMake}
                    >
                      <Select
                        placeholder="Select make"
                        data={VEHICLE_MAKES}
                        searchable
                        clearable
                        {...form.getInputProps("vehicleMake")}
                        onChange={(value) => {
                          form.setFieldValue("vehicleMake", value || "");
                          handleMakeChange(value);
                        }}
                        error={null} // Hide default error
                      />
                    </CustomInputWrapper>
                    
                    <CustomInputWrapper
                      label="Vehicle Model"
                      required
                      error={form.errors.vehicleModel}
                    >
                      <Select
                        placeholder="Select model"
                        data={availableModels}
                        searchable
                        clearable
                        disabled={!vehicleMake}
                        {...form.getInputProps("vehicleModel")}
                        onChange={(value) => {
                          form.setFieldValue("vehicleModel", value || "");
                          handleModelChange(value);
                        }}
                        error={null} // Hide default error
                      />
                    </CustomInputWrapper>
                    
                    <CustomInputWrapper
                      label="Vehicle Year"
                      required
                      error={form.errors.vehicleYear}
                    >
                      <Select
                        placeholder="Select year"
                        data={VEHICLE_YEARS}
                        searchable
                        clearable
                        {...form.getInputProps("vehicleYear")}
                        onChange={(value) => {
                          form.setFieldValue("vehicleYear", value || "");
                          handleYearChange(value);
                        }}
                        error={null} // Hide default error
                      />
                    </CustomInputWrapper>
                  </Stack>
                </Stack>
              </Box>
            </Stepper.Step>
            
            <Stepper.Step
              label="Date Range"
              description="Start and end dates"
              icon={<IconCalendar size={18} />}
              allowStepSelect={activeStep > 1}
            >
              <Box mt="md">
                <Title order={3} size="h4" mb="md">Date Range</Title>
                <Text c="dimmed" mb="lg">Select the start and end dates for your mileage log</Text>
                
                <Stack gap="md">
                  {isMobile ? (
                    <Stack>
                      <CustomInputWrapper
                        label="Start Date"
                        required
                        error={form.errors.startDate}
                      >
                        <DatePickerInput
                          placeholder="Select start date"
                          value={startDate}
                          onChange={(date) => date && handleStartDateChange(date)}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                      <CustomInputWrapper
                        label="End Date"
                        required
                        error={form.errors.endDate}
                      >
                        <DatePickerInput
                          placeholder="Select end date"
                          value={endDate}
                          onChange={(date) => date && handleEndDateChange(date)}
                          minDate={startDate}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                    </Stack>
                  ) : (
                    <Group grow>
                      <CustomInputWrapper
                        label="Start Date"
                        required
                        error={form.errors.startDate}
                      >
                        <DatePickerInput
                          placeholder="Select start date"
                          value={startDate}
                          onChange={(date) => date && handleStartDateChange(date)}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                      <CustomInputWrapper
                        label="End Date"
                        required
                        error={form.errors.endDate}
                      >
                        <DatePickerInput
                          placeholder="Select end date"
                          value={endDate}
                          onChange={(date) => date && handleEndDateChange(date)}
                          minDate={startDate}
                          error={null} // Hide default error
                        />
                      </CustomInputWrapper>
                    </Group>
                  )}
                </Stack>
              </Box>
            </Stepper.Step>
            
            <Stepper.Step
              label="Trip Details"
              description="Business and personal miles"
              icon={<IconRoute size={18} />}
              allowStepSelect={activeStep > 2}
            >
              <Box mt="md">
                <Title order={3} size="h4" mb="md">Trip Details</Title>
                <Text c="dimmed" mb="lg">Specify your business type and personal miles</Text>
                
                <Stack gap="md">
                  <CustomInputWrapper
                    label="Business Type"
                    required
                    error={form.errors.businessType}
                  >
                    <Select
                      placeholder="Select business type"
                      data={businessTypeOptions}
                      {...form.getInputProps("businessType")}
                      onChange={(value) => {
                        if (value) {
                          form.setFieldValue("businessType", value);
                          onBusinessTypeChange(value);
                        }
                      }}
                      error={null} // Hide default error
                    />
                  </CustomInputWrapper>

                  <CustomInputWrapper
                    label="Personal Miles"
                    error={form.errors.totalPersonalMiles}
                  >
                    <TextInput
                      placeholder="Enter personal miles"
                      {...form.getInputProps("totalPersonalMiles")}
                      onChange={(e) => {
                        form.setFieldValue("totalPersonalMiles", e.target.value);
                        onTotalPersonalMilesChange(e.target.value);
                      }}
                      error={null} // Hide default error
                    />
                  </CustomInputWrapper>
                </Stack>
              </Box>
            </Stepper.Step>
            
            <Stepper.Step
              label="Review & Generate"
              description="Confirm and create log"
              icon={<IconFileCheck size={18} />}
            >
              <Box mt="md">
                <Title order={3} size="h4" mb="md">Review Your Mileage Log</Title>
                <Text c="dimmed" mb="lg">Please review the information before generating your log</Text>
                
                <Paper p="md" withBorder radius="md">
                  <Stack gap="md">
                    <Group>
                      <Text fw={500} w={180}>Vehicle:</Text>
                      <Text>
                        {form.values.vehicleYear} {form.values.vehicleMake && VEHICLE_MAKES.find(m => m.value === form.values.vehicleMake)?.label} {form.values.vehicleModel && availableModels.find(m => m.value === form.values.vehicleModel)?.label}
                      </Text>
                    </Group>
                    <Divider />
                    
                    <Group>
                      <Text fw={500} w={180}>Date Range:</Text>
                      <Text>
                        {form.values.startDate?.toLocaleDateString()} to {form.values.endDate?.toLocaleDateString()}
                      </Text>
                    </Group>
                    <Divider />
                    
                    <Group>
                      <Text fw={500} w={180}>Odometer Readings:</Text>
                      <Text>
                        {form.values.startMileage} to {form.values.endMileage} 
                        ({totalMiles} total miles)
                      </Text>
                    </Group>
                    <Divider />
                    
                    <Group>
                      <Text fw={500} w={180}>Business Type:</Text>
                      <Text>{form.values.businessType || 'Not specified'}</Text>
                    </Group>
                    <Divider />
                    
                    <Group>
                      <Text fw={500} w={180}>Miles Breakdown:</Text>
                      <Stack gap="xs">
                        <Text>Business Miles: {businessMiles}</Text>
                        <Text>Personal Miles: {form.values.totalPersonalMiles || 0}</Text>
                        <Text>Total Miles: {totalMiles}</Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Paper>
              </Box>
            </Stepper.Step>
          </Stepper>
        </Paper>

        <Group justify="space-between" mt="xl">
          {activeStep > 0 ? (
            <Button 
              variant="default" 
              onClick={prevStep}
              leftSection={<IconChevronLeft size={14} />}
              size={isMobile ? "md" : "sm"}
            >
              Back
            </Button>
          ) : (
            <Button 
              variant="light" 
              color="gray" 
              onClick={handleReset}
              size={isMobile ? "md" : "sm"}
            >
              Reset
            </Button>
          )}

          {activeStep === 3 ? (
            <Button
              variant="gradient"
              onClick={handleSubmit}
              size={isMobile ? "md" : "sm"}
              rightSection={<IconCheck size={14} />}
            >
              Generate Log
            </Button>
          ) : (
            <Button 
              onClick={nextStep} 
              variant="filled"
              size={isMobile ? "md" : "sm"}
              rightSection={<IconChevronRight size={14} />}
            >
              Next Step
            </Button>
          )}
        </Group>
      </form>
    </Box>
  );
}
