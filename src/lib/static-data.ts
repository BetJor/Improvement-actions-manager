
import type { User, UserGroup } from './types';

export const users: User[] = [
    { id: 'user-1', name: 'Ana García', role: 'Director', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', email: 'ana.garcia@example.com' },
    { id: 'user-2', name: 'Carlos Rodríguez', role: 'Responsible', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', email: 'carlos.rodriguez@example.com' },
    { id: 'user-3', name: 'Laura Martinez', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', email: 'laura.martinez@example.com' },
    { id: 'user-4', name: 'Javier López', role: 'Committee', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708c', email: 'javier.lopez@example.com' },
    { id: 'user-5', name: 'Sofía Hernandez', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=a0425e8ff4e29026704d', email: 'sofia.hernandez@example.com' },
    { id: 'user-6', name: 'David Fernandez', role: 'Responsible', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', email: 'david.fernandez@example.com' },
    { id: 'user-7', name: 'Elena Gomez', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702e', email: 'elena.gomez@example.com' },
    { id: 'user-8', name: 'Miguel Perez', role: 'Director', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d', email: 'miguel.perez@example.com' },
    { id: 'user-9', name: 'Elisabet Jordana', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026709e', email: 'elisabet.jordana@example.com' }
  ];
  
  export const groups: UserGroup[] = [
    { id: 'finance@example.com', name: 'Departament Financer', userIds: ['user-1', 'user-2'] },
    { id: 'it-security@example.com', name: 'Seguretat Informàtica', userIds: ['user-5'] },
    { id: 'customer-support@example.com', name: 'Atenció al Client', userIds: ['user-1', 'user-3'] },
    { id: 'quality-management@example.com', name: 'Gestió de Qualitat', userIds: ['user-2', 'user-4'] },
    { id: 'risk-management@example.com', name: 'Gestió de Riscos', userIds: ['user-1', 'user-5'] },
    { id: 'it-legacy-systems@example.com', name: 'Sistemes Legacy', userIds: ['user-5'] },
    { id: 'rsc-committee@example.com', name: 'Comitè RSC', userIds: ['user-3', 'user-4'] },
    { id: 'bcn_ca_director@example.com', name: 'Direcció CA (BCN)', userIds: []}
  ];

export const locations = [
  {
    "codigo_centro": "0101",
    "descripcion_centro": "Llodio",
    "responsable": "Llodio CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JF",
      "descripcion": "Llodio"
    }
  },
  {
    "codigo_centro": "0102",
    "descripcion_centro": "Vitoria-Gasteiz",
    "responsable": "Vitoria CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JB",
      "descripcion": "Vitoria"
    }
  },
  {
    "codigo_centro": "0201",
    "descripcion_centro": "Albacete",
    "responsable": "Albacete CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "GB",
      "descripcion": "Albacete"
    }
  },
  {
    "codigo_centro": "0301",
    "descripcion_centro": "Alacant-Alicante",
    "responsable": "Alicante CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "UA",
      "descripcion": "Alicante"
    },
    "ambito_sector": {
      "codigo": "GC",
      "descripcion": "Alicante"
    }
  },
  {
    "codigo_centro": "0302",
    "descripcion_centro": "Elche-Elx",
    "responsable": "Elche CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "UA",
      "descripcion": "Alicante"
    },
    "ambito_sector": {
      "codigo": "GH",
      "descripcion": "Elche"
    }
  },
  {
    "codigo_centro": "0303",
    "descripcion_centro": "Benidorm",
    "responsable": "Benidorm CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "UA",
      "descripcion": "Alicante"
    },
    "ambito_sector": {
      "codigo": "GR",
      "descripcion": "Benidorm"
    }
  },
  {
    "codigo_centro": "0401",
    "descripcion_centro": "Almería",
    "responsable": "Almería CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "GD",
      "descripcion": "Almería"
    }
  },
  {
    "codigo_centro": "0402",
    "descripcion_centro": "Olula del Río",
    "responsable": "Olula del Rio CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "GK",
      "descripcion": "Olula del Río"
    }
  },
  {
    "codigo_centro": "0404",
    "descripcion_centro": "Almería-2",
    "responsable": "Almería CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "GD",
      "descripcion": "Almería"
    }
  },
  {
    "codigo_centro": "0501",
    "descripcion_centro": "Ávila",
    "responsable": "Avila CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DB",
      "descripcion": "Ávila"
    }
  },
  {
    "codigo_centro": "0601",
    "descripcion_centro": "Badajoz",
    "responsable": "Badajoz CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "DC",
      "descripcion": "Badajoz"
    }
  },
  {
    "codigo_centro": "0602",
    "descripcion_centro": "Villanueva de la Serena",
    "responsable": "Villanueva de la Serena CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "DT",
      "descripcion": "Villanueva de la Serena"
    }
  },
  {
    "codigo_centro": "0603",
    "descripcion_centro": "Mérida",
    "responsable": "Mérida CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "DW",
      "descripcion": "Mérida"
    }
  },
  {
    "codigo_centro": "0701",
    "descripcion_centro": "Palma de Mallorca",
    "responsable": "Palma de Mallorca CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "FJ",
      "descripcion": "Palma de Mallorca"
    }
  },
  {
    "codigo_centro": "0702",
    "descripcion_centro": "Manacor",
    "responsable": "Manacor CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "FS",
      "descripcion": "Manacor"
    }
  },
  {
    "codigo_centro": "0703",
    "descripcion_centro": "Ciutadella",
    "responsable": "Ciutadella CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "FK",
      "descripcion": "Ciutadella"
    }
  },
  {
    "codigo_centro": "0704",
    "descripcion_centro": "Maó",
    "responsable": "Maó CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "FL",
      "descripcion": "Maó"
    }
  },
  {
    "codigo_centro": "0705",
    "descripcion_centro": "Eivissa",
    "responsable": "Eivissa CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "FI",
      "descripcion": "Eivissa"
    }
  },
  {
    "codigo_centro": "0706",
    "descripcion_centro": "Manacor-2",
    "responsable": "Manacor CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "FS",
      "descripcion": "Manacor"
    }
  },
  {
    "codigo_centro": "0801",
    "descripcion_centro": "Barcelona-Vía Augusta",
    "responsable": "BCN-Via Augusta CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BD",
      "descripcion": "BCN-Vía Augusta"
    }
  },
  {
    "codigo_centro": "0802",
    "descripcion_centro": "Barcelona-Sagrera",
    "responsable": "BCN-Sagrera CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BS",
      "descripcion": "BCN-Horta"
    }
  },
  {
    "codigo_centro": "0803",
    "descripcion_centro": "Barcelona-Casp",
    "responsable": "BCN-Casp CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BX",
      "descripcion": "BCN-Casp"
    }
  },
  {
    "codigo_centro": "0804",
    "descripcion_centro": "Vilanova i la Geltrú",
    "responsable": "Vilanova i la Geltrú CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BK",
      "descripcion": "Vilanova i la Geltrú"
    }
  },
  {
    "codigo_centro": "0805",
    "descripcion_centro": "Badalona",
    "responsable": "Badalona CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BC",
      "descripcion": "Badalona"
    }
  },
  {
    "codigo_centro": "0806",
    "descripcion_centro": "L'Hospitalet de Llobregat",
    "responsable": "L'Hospitalet de Llobregat CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BE",
      "descripcion": "Hospitalet de Llobregat"
    }
  },
  {
    "codigo_centro": "0807",
    "descripcion_centro": "Manresa",
    "responsable": "Manresa CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BO",
      "descripcion": "Manresa"
    }
  },
  {
    "codigo_centro": "0809",
    "descripcion_centro": "Parets del Vallès",
    "responsable": "Parets del Vallés CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BP",
      "descripcion": "Parets del Vallés"
    }
  },
  {
    "codigo_centro": "0810",
    "descripcion_centro": "Sabadell",
    "responsable": "Sabadell CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BQ",
      "descripcion": "Sabadell"
    }
  },
  {
    "codigo_centro": "0811",
    "descripcion_centro": "Vic",
    "responsable": "Vic CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BT",
      "descripcion": "Vic"
    }
  },
  {
    "codigo_centro": "0812",
    "descripcion_centro": "Pineda de Mar",
    "responsable": "Pineda de Mar CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BB",
      "descripcion": "Pineda de Mar"
    }
  },
  {
    "codigo_centro": "0813",
    "descripcion_centro": "Berga",
    "responsable": "Berga CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BL",
      "descripcion": "Berga"
    }
  },
  {
    "codigo_centro": "0814",
    "descripcion_centro": "Mollet del Vallès",
    "responsable": "Mollet del Vallés CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BG",
      "descripcion": "Mollet del Vallés"
    }
  },
  {
    "codigo_centro": "0815",
    "descripcion_centro": "El Prat de Llobregat",
    "responsable": "El Prat de Llobregat CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BV",
      "descripcion": "Prat de Llobregat"
    }
  },
  {
    "codigo_centro": "0816",
    "descripcion_centro": "Gavà",
    "responsable": "Gavá CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BU",
      "descripcion": "Gavá"
    }
  },
  {
    "codigo_centro": "0817",
    "descripcion_centro": "Cerdanyola del Vallès",
    "responsable": "Cerdanyola del Vallés CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BW",
      "descripcion": "Cerdanyola del Vallés"
    }
  },
  {
    "codigo_centro": "0818",
    "descripcion_centro": "Sant Feliu de Llobregat",
    "responsable": "Sant Feliu de Llobregat CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BI",
      "descripcion": "Sant Feliu de Llobregat"
    }
  },
  {
    "codigo_centro": "0819",
    "descripcion_centro": "Martorell",
    "responsable": "Martorell CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BN",
      "descripcion": "Martorell"
    }
  },
  {
    "codigo_centro": "0820",
    "descripcion_centro": "Sant Boi de Llobregat",
    "responsable": "Sant Boi de Llobregat CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BZ",
      "descripcion": "Sant Boi de Llobregat"
    }
  },
  {
    "codigo_centro": "0821",
    "descripcion_centro": "Molins de Rei",
    "responsable": "Molins de Rei CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BR",
      "descripcion": "Molins de Rei"
    }
  },
  {
    "codigo_centro": "0822",
    "descripcion_centro": "Palau-Solità i Plegamans",
    "responsable": "Mollet del Vallés CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BF",
      "descripcion": "Palau de Plegamans"
    }
  },
  {
    "codigo_centro": "0823",
    "descripcion_centro": "Instalación y Equipos Barcelona",
    "responsable": "DIRECCION INSTALACIONES AB_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AB",
      "descripcion": "Dirección Instalaciones"
    }
  },
  {
    "codigo_centro": "0824",
    "descripcion_centro": "Martorell-2",
    "responsable": "Martorell CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "BN",
      "descripcion": "Martorell"
    }
  },
  {
    "codigo_centro": "0825",
    "descripcion_centro": "Vic-2",
    "responsable": "Vic CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BT",
      "descripcion": "Vic"
    }
  },
  {
    "codigo_centro": "0826",
    "descripcion_centro": "Mercabarna",
    "responsable": "Mercabarna CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BM",
      "descripcion": "Mercabarna"
    }
  },
  {
    "codigo_centro": "0827",
    "descripcion_centro": "Barcelona-Sants",
    "responsable": "BCN-Sants CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BJ",
      "descripcion": "BCN-Sants"
    }
  },
  {
    "codigo_centro": "0828",
    "descripcion_centro": "Mataró",
    "responsable": "Mataró CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BY",
      "descripcion": "Mataró"
    }
  },
  {
    "codigo_centro": "0830",
    "descripcion_centro": "Área Gestión",
    "responsable": "CATALUNYA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "0831",
    "descripcion_centro": "Granollers",
    "responsable": "Granollers CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BH",
      "descripcion": "Granollers"
    }
  },
  {
    "codigo_centro": "0832",
    "descripcion_centro": "Dpto. Pago Delegado Barcelona",
    "responsable": "DIRECCION CONTROL GESTION AK_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AK",
      "descripcion": "Dirección Control Gestión"
    }
  },
  {
    "codigo_centro": "0833",
    "descripcion_centro": "Vilafranca del Penedès",
    "responsable": "Vilafranca del Penedès CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "PD",
      "descripcion": "Vilafranca del Penedès"
    }
  },
  {
    "codigo_centro": "0834",
    "descripcion_centro": "Terrassa",
    "responsable": "Terrassa CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "PE",
      "descripcion": "Terrassa"
    }
  },
  {
    "codigo_centro": "0835",
    "descripcion_centro": "Servicio de Atención al Usuario",
    "responsable": "SAU A7AC_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A7",
      "descripcion": "Dirección de Coordinación de Servicios y Comunicación"
    }
  },
  {
    "codigo_centro": "0836",
    "descripcion_centro": "Servicios WEB",
    "responsable": "DIRECCION MARKETING Y SERVICIOS A7_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AS",
      "descripcion": "Dirección de Comunicación"
    }
  },
  {
    "codigo_centro": "0837",
    "descripcion_centro": "Montcada i Reixac",
    "responsable": "Cerdanyola del Vallés CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "2A",
      "descripcion": "Catalunya Centro (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "PG",
      "descripcion": "Montcada i Reixac"
    }
  },
  {
    "codigo_centro": "0838",
    "descripcion_centro": "Unidad Central de Contingencias Comunes - U3C",
    "responsable": "DIRECCION ASISTENCIA SANITARIA A9_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": "Dirección Prestaciones"
    }
  },
  {
    "codigo_centro": "0839",
    "descripcion_centro": "Barcelona-Horta",
    "responsable": "BCN-Sagrera CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "BS",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "0840",
    "descripcion_centro": "Viladecans",
    "responsable": "CATALUNYA DT_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "PV",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "0841",
    "descripcion_centro": "Sant Cugat del Vallès",
    "responsable": null,
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "PS",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "0881",
    "descripcion_centro": "UBS Barcelona Servicio de Prevención Propio",
    "responsable": "SERVICIO PREVENCION PROPIO AT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AT",
      "descripcion": "Servicio Prevención Propio"
    }
  },
  {
    "codigo_centro": "0882",
    "descripcion_centro": "Centro de Formación Barcelona",
    "responsable": "DIRECCION RECURSOS HUMANOS FORMACION AC_Director-AF",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AC",
      "descripcion": "Dirección Recursos Humanos"
    }
  },
  {
    "codigo_centro": "0884",
    "descripcion_centro": "Seguridad e Higiene",
    "responsable": "CATALUNYA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "0885",
    "descripcion_centro": "Hospital Sant Cugat",
    "responsable": "HOSPITAL SANT CUGAT ZB_Gerente",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Hospital",
    "ambito_comunidad": {
      "codigo": "Z",
      "descripcion": "Hospitales"
    },
    "ambito_area": {
      "codigo": "ZA",
      "descripcion": "Hospitales"
    },
    "ambito_sector": {
      "codigo": "ZB",
      "descripcion": "Hospital Sant Cugat"
    }
  },
  {
    "codigo_centro": "0889",
    "descripcion_centro": "Servicio de Traumatología Ocular",
    "responsable": "DIRECCION ASISTENCIA SANITARIA A9_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": "Dirección Asistencia Sanitaria"
    }
  },
  {
    "codigo_centro": "0890",
    "descripcion_centro": "Organización Gral. Barcelona",
    "responsable": "DIRECCION ASESORIA JURIDICA A8_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Sede Central",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "0892",
    "descripcion_centro": "Organización General AVA - 18",
    "responsable": "CATALUNYA DT_Coordinador-PV",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Sede Central",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "0893",
    "descripcion_centro": "Organización General AVA - 21",
    "responsable": "DIRECCION SISTEMAS INFORMACION AG_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Organización General",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "0894",
    "descripcion_centro": "Organización General AVA - 48",
    "responsable": "DIRECCION CONTRATACION_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Sede Central",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "0895",
    "descripcion_centro": "Organización General Pedro i Pons",
    "responsable": "SUBDIRECCION GENERAL AN_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Organización General",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "0901",
    "descripcion_centro": "Burgos",
    "responsable": "Burgos CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "JC",
      "descripcion": "Burgos"
    }
  },
  {
    "codigo_centro": "1001",
    "descripcion_centro": "Cáceres",
    "responsable": "Cáceres CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "DD",
      "descripcion": "Cáceres"
    }
  },
  {
    "codigo_centro": "1101",
    "descripcion_centro": "Cádiz",
    "responsable": "Cádiz CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KC",
      "descripcion": "Cádiz"
    }
  },
  {
    "codigo_centro": "1102",
    "descripcion_centro": "Algeciras",
    "responsable": "Algeciras CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KB",
      "descripcion": "Algeciras"
    }
  },
  {
    "codigo_centro": "1103",
    "descripcion_centro": "Jerez de la Frontera",
    "responsable": "Jerez CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KI",
      "descripcion": "Jerez"
    }
  },
  {
    "codigo_centro": "1201",
    "descripcion_centro": "Castelló-Castellón",
    "responsable": "Castellón CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GF",
      "descripcion": "Castellón"
    }
  },
  {
    "codigo_centro": "1301",
    "descripcion_centro": "Ciudad Real",
    "responsable": "Ciudad Real CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DN",
      "descripcion": "Ciudad Real"
    }
  },
  {
    "codigo_centro": "1302",
    "descripcion_centro": "Puertollano",
    "responsable": "Puertollano CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DQ",
      "descripcion": "Puertollano"
    }
  },
  {
    "codigo_centro": "1303",
    "descripcion_centro": "Valdepeñas",
    "responsable": "Valdepeñas CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DR",
      "descripcion": "Valdepeñas"
    }
  },
  {
    "codigo_centro": "1304",
    "descripcion_centro": "Alcázar de San Juan",
    "responsable": "Alcázar de San Juan CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DS",
      "descripcion": "Alcázar de San Juan"
    }
  },
  {
    "codigo_centro": "1305",
    "descripcion_centro": "Ciudad Real-2",
    "responsable": "Ciudad Real CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DN",
      "descripcion": "Ciudad Real"
    }
  },
  {
    "codigo_centro": "1401",
    "descripcion_centro": "Córdoba",
    "responsable": "Córdoba CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KE",
      "descripcion": "Córdoba"
    }
  },
  {
    "codigo_centro": "1402",
    "descripcion_centro": "Córdoba-2",
    "responsable": "Córdoba CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KE",
      "descripcion": "Córdoba"
    }
  },
  {
    "codigo_centro": "1403",
    "descripcion_centro": "Pozoblanco",
    "responsable": "Pozoblanco CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KV",
      "descripcion": "Pozoblanco"
    }
  },
  {
    "codigo_centro": "1501",
    "descripcion_centro": "A Coruña",
    "responsable": "A Coruña CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "ID",
      "descripcion": "A Coruña"
    }
  },
  {
    "codigo_centro": "1502",
    "descripcion_centro": "Ferrol",
    "responsable": "Ferrol CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "IE",
      "descripcion": "Ferrol"
    }
  },
  {
    "codigo_centro": "1503",
    "descripcion_centro": "Santiago de Compostela",
    "responsable": "Santiago de Compostela CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "IP",
      "descripcion": "Santiago de Compostela"
    }
  },
  {
    "codigo_centro": "1504",
    "descripcion_centro": "Ferrol-2",
    "responsable": "Ferrol CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "WA",
      "descripcion": "Cpl. Resto Galicia (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "IE",
      "descripcion": "Ferrol"
    }
  },
  {
    "codigo_centro": "1505",
    "descripcion_centro": "A Coruña-2",
    "responsable": "A Coruña CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "WA",
      "descripcion": "Cpl. Resto Galicia (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "ID",
      "descripcion": "A Coruña"
    }
  },
  {
    "codigo_centro": "1601",
    "descripcion_centro": "Cuenca",
    "responsable": "Cuenca CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DE",
      "descripcion": "Cuenca"
    }
  },
  {
    "codigo_centro": "1701",
    "descripcion_centro": "Girona",
    "responsable": "Girona CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "FH",
      "descripcion": "Girona"
    }
  },
  {
    "codigo_centro": "1703",
    "descripcion_centro": "Palamós",
    "responsable": "Palamos CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "FM",
      "descripcion": "Palamós"
    }
  },
  {
    "codigo_centro": "1704",
    "descripcion_centro": "Olot",
    "responsable": "Olot CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "FT",
      "descripcion": "Olot"
    }
  },
  {
    "codigo_centro": "1705",
    "descripcion_centro": "Figueres",
    "responsable": "Figueres CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "FU",
      "descripcion": "Figueres"
    }
  },
  {
    "codigo_centro": "1801",
    "descripcion_centro": "Granada",
    "responsable": "Granada CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KF",
      "descripcion": "Granada"
    }
  },
  {
    "codigo_centro": "1802",
    "descripcion_centro": "Granada-2",
    "responsable": "Granada CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "1803",
    "descripcion_centro": "Motril",
    "responsable": "Motril CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KR",
      "descripcion": "Motril"
    }
  },
  {
    "codigo_centro": "1901",
    "descripcion_centro": "Guadalajara",
    "responsable": "Guadalajara CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DF",
      "descripcion": "Guadalajara"
    }
  },
  {
    "codigo_centro": "1902",
    "descripcion_centro": "Guadalajara-2",
    "responsable": "Guadalajara CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DF",
      "descripcion": "Guadalajara"
    }
  },
  {
    "codigo_centro": "2001",
    "descripcion_centro": "Donostia-San Sebastián",
    "responsable": "San Sebastián CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JD",
      "descripcion": "San Sebastián"
    }
  },
  {
    "codigo_centro": "2002",
    "descripcion_centro": "Azpeitia",
    "responsable": "Azpeitia CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JM",
      "descripcion": "Azpeitia"
    }
  },
  {
    "codigo_centro": "2003",
    "descripcion_centro": "Bergara",
    "responsable": "Bergara CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JO",
      "descripcion": "Bergara"
    }
  },
  {
    "codigo_centro": "2004",
    "descripcion_centro": "Tolosa",
    "responsable": "Tolosa CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JR",
      "descripcion": "Tolosa"
    }
  },
  {
    "codigo_centro": "2101",
    "descripcion_centro": "Huelva",
    "responsable": "Huelva CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KG",
      "descripcion": "Huelva"
    }
  },
  {
    "codigo_centro": "2201",
    "descripcion_centro": "Huesca",
    "responsable": "Huesca CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FC",
      "descripcion": "Huesca"
    }
  },
  {
    "codigo_centro": "2203",
    "descripcion_centro": "Sabiñánigo",
    "responsable": "Sabiñánigo CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FW",
      "descripcion": "Sabiñánigo"
    }
  },
  {
    "codigo_centro": "2301",
    "descripcion_centro": "Jaén",
    "responsable": "Jaén CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KH",
      "descripcion": "Jaén"
    }
  },
  {
    "codigo_centro": "2401",
    "descripcion_centro": "León",
    "responsable": "León CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DO",
      "descripcion": "León"
    }
  },
  {
    "codigo_centro": "2403",
    "descripcion_centro": "Ponferrada",
    "responsable": "Ponferrada CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DP",
      "descripcion": "Ponferrada"
    }
  },
  {
    "codigo_centro": "2404",
    "descripcion_centro": "Bembibre",
    "responsable": "Ponferrada CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "2501",
    "descripcion_centro": "Lleida",
    "responsable": "Lleida CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "FD",
      "descripcion": "Lleida"
    }
  },
  {
    "codigo_centro": "2502",
    "descripcion_centro": "Cervera",
    "responsable": "Cervera CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "FN",
      "descripcion": "Cervera"
    }
  },
  {
    "codigo_centro": "2601",
    "descripcion_centro": "Logroño",
    "responsable": "Logroño CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "M",
      "descripcion": "La Rioja"
    },
    "ambito_area": {
      "codigo": "MA",
      "descripcion": "Cpl. La Rioja"
    },
    "ambito_sector": {
      "codigo": "JG",
      "descripcion": "Logroño"
    }
  },
  {
    "codigo_centro": "2602",
    "descripcion_centro": "Logroño-2",
    "responsable": "Logroño CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "M",
      "descripcion": "La Rioja"
    },
    "ambito_area": {
      "codigo": "MA",
      "descripcion": "Cpl. La Rioja"
    },
    "ambito_sector": {
      "codigo": "JG",
      "descripcion": "Logroño"
    }
  },
  {
    "codigo_centro": "2701",
    "descripcion_centro": "Lugo",
    "responsable": "Lugo CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "IH",
      "descripcion": "Lugo"
    }
  },
  {
    "codigo_centro": "2702",
    "descripcion_centro": "Lugo-2",
    "responsable": "Lugo CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "2800",
    "descripcion_centro": "Región Madrid",
    "responsable": "MADRID DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "2801",
    "descripcion_centro": "Madrid",
    "responsable": "Madrid CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "6A",
      "descripcion": "Madrid Centro"
    },
    "ambito_sector": {
      "codigo": "CG",
      "descripcion": "Madrid"
    }
  },
  {
    "codigo_centro": "2802",
    "descripcion_centro": "Alcalá de Henares",
    "responsable": "Alcalá de Henares CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "CB",
      "descripcion": "Alcalá de Henares"
    }
  },
  {
    "codigo_centro": "2803",
    "descripcion_centro": "Ciudad Lineal",
    "responsable": "Ciudad Lineal CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "6A",
      "descripcion": "Madrid Centro"
    },
    "ambito_sector": {
      "codigo": "CC",
      "descripcion": "Ciudad Lineal"
    }
  },
  {
    "codigo_centro": "2804",
    "descripcion_centro": "Coslada",
    "responsable": "Coslada CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "CD",
      "descripcion": "Coslada"
    }
  },
  {
    "codigo_centro": "2805",
    "descripcion_centro": "Fuenlabrada",
    "responsable": "Fuenlabrada CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CE",
      "descripcion": "Fuenlabrada"
    }
  },
  {
    "codigo_centro": "2806",
    "descripcion_centro": "Legazpi",
    "responsable": "Legazpi CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CF",
      "descripcion": "Legazpi"
    }
  },
  {
    "codigo_centro": "2807",
    "descripcion_centro": "Móstoles",
    "responsable": "Móstoles CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CH",
      "descripcion": "Móstoles"
    }
  },
  {
    "codigo_centro": "2808",
    "descripcion_centro": "Pinto",
    "responsable": "Pinto CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CI",
      "descripcion": "Pinto"
    }
  },
  {
    "codigo_centro": "2809",
    "descripcion_centro": "Torrejón de Ardoz",
    "responsable": "Torrejón de Ardoz CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "CJ",
      "descripcion": "Torrejón de Ardoz"
    }
  },
  {
    "codigo_centro": "2810",
    "descripcion_centro": "Villaverde Alto",
    "responsable": "Villaverde Alto CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CK",
      "descripcion": "Villaverde Alto"
    }
  },
  {
    "codigo_centro": "2811",
    "descripcion_centro": "Alcobendas",
    "responsable": "Alcobendas CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "CL",
      "descripcion": "Alcobendas"
    }
  },
  {
    "codigo_centro": "2813",
    "descripcion_centro": "Valdemoro",
    "responsable": "Valdemoro CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CS",
      "descripcion": "Valdemoro"
    }
  },
  {
    "codigo_centro": "2814",
    "descripcion_centro": "Getafe",
    "responsable": "Getafe CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CP",
      "descripcion": "Getafe"
    }
  },
  {
    "codigo_centro": "2817",
    "descripcion_centro": "Arganda del Rey",
    "responsable": "Arganda del Rey CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CN",
      "descripcion": "Arganda del Rey"
    }
  },
  {
    "codigo_centro": "2818",
    "descripcion_centro": "Tres Cantos",
    "responsable": "Tres Cantos CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "CX",
      "descripcion": "Tres Cantos"
    }
  },
  {
    "codigo_centro": "2819",
    "descripcion_centro": "Madrid-2",
    "responsable": "MADRID_S.H. CASH_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "2820",
    "descripcion_centro": "Legazpi 2",
    "responsable": "Legazpi CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AK",
      "descripcion": "Dirección Control Gestión"
    }
  },
  {
    "codigo_centro": "2821",
    "descripcion_centro": "Las Rozas",
    "responsable": "Las Rozas CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "CR",
      "descripcion": "Las Rozas"
    }
  },
  {
    "codigo_centro": "2823",
    "descripcion_centro": "Madrid -Eloy Gonzalo-",
    "responsable": "MADRID DT_Administrador-SSGG",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "CA",
      "descripcion": "Cpl. Madrid"
    },
    "ambito_sector": {
      "codigo": "CA",
      "descripcion": "Cpl. Madrid"
    }
  },
  {
    "codigo_centro": "2824",
    "descripcion_centro": "Móstoles-2",
    "responsable": "Móstoles CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CH",
      "descripcion": "Móstoles"
    }
  },
  {
    "codigo_centro": "2825",
    "descripcion_centro": "Mercamadrid",
    "responsable": "Mercamadrid CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CO",
      "descripcion": "Mercamadrid"
    }
  },
  {
    "codigo_centro": "2826",
    "descripcion_centro": "Collado Villalba",
    "responsable": "Collado Villalba CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "CT",
      "descripcion": "Collado Villalba"
    }
  },
  {
    "codigo_centro": "2827",
    "descripcion_centro": "Humanes",
    "responsable": "Humanes CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CU",
      "descripcion": "Humanes"
    }
  },
  {
    "codigo_centro": "2828",
    "descripcion_centro": "Chamartín",
    "responsable": "Chamartín CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "6A",
      "descripcion": "Madrid Centro"
    },
    "ambito_sector": {
      "codigo": "CM",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "2881",
    "descripcion_centro": "UBS Madrid Servicio de Prevención Propio",
    "responsable": "SERVICIO PREVENCION PROPIO AT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AT",
      "descripcion": "Servicio Prevención Propio"
    }
  },
  {
    "codigo_centro": "2882",
    "descripcion_centro": "Centro de Formación Madrid",
    "responsable": "DIRECCION RECURSOS HUMANOS FORMACION AC_Director-AF",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AC",
      "descripcion": "Dirección Recursos Humanos"
    }
  },
  {
    "codigo_centro": "2888",
    "descripcion_centro": "Hospital Coslada",
    "responsable": "HOSPITAL COSLADA ZC_Gerente",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Hospital",
    "ambito_comunidad": {
      "codigo": "Z",
      "descripcion": "Hospitales"
    },
    "ambito_area": {
      "codigo": "ZA",
      "descripcion": "Hospitales"
    },
    "ambito_sector": {
      "codigo": "ZC",
      "descripcion": "Hospital Coslada"
    }
  },
  {
    "codigo_centro": "2890",
    "descripcion_centro": "Organización Gral. Madrid",
    "responsable": "MADRID DT_administrador-SSGG",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Sede Central",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "2901",
    "descripcion_centro": "Málaga",
    "responsable": "Málaga CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KJ",
      "descripcion": "Málaga"
    }
  },
  {
    "codigo_centro": "2902",
    "descripcion_centro": "Marbella",
    "responsable": "Marbella CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KM",
      "descripcion": "Marbella"
    }
  },
  {
    "codigo_centro": "2903",
    "descripcion_centro": "Fuengirola",
    "responsable": "Fuengirola CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KP",
      "descripcion": "Fuengirola"
    }
  },
  {
    "codigo_centro": "2904",
    "descripcion_centro": "Ronda",
    "responsable": "Ronda CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KS",
      "descripcion": "Ronda"
    }
  },
  {
    "codigo_centro": "2905",
    "descripcion_centro": "Guadalhorce",
    "responsable": "Guadalhorce CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KN",
      "descripcion": "Guadalhorce"
    }
  },
  {
    "codigo_centro": "2906",
    "descripcion_centro": "Vélez-Málaga",
    "responsable": "Vélez-Málaga CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KT",
      "descripcion": "Vélez (EXTINGUIDO)"
    }
  },
  {
    "codigo_centro": "2907",
    "descripcion_centro": "San Pedro de Alcántara",
    "responsable": "San Pedro de Alcántara CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KU",
      "descripcion": "San Pedro de Alcántara"
    }
  },
  {
    "codigo_centro": "2908",
    "descripcion_centro": "Málaga-2",
    "responsable": "Málaga CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KJ",
      "descripcion": "Málaga"
    }
  },
  {
    "codigo_centro": "3001",
    "descripcion_centro": "Murcia",
    "responsable": "Murcia CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "P",
      "descripcion": "Murcia"
    },
    "ambito_area": {
      "codigo": "PA",
      "descripcion": "Cpl. Murcia"
    },
    "ambito_sector": {
      "codigo": "GJ",
      "descripcion": "Murcia"
    }
  },
  {
    "codigo_centro": "3002",
    "descripcion_centro": "Cartagena",
    "responsable": "Cartagena CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "P",
      "descripcion": "Murcia"
    },
    "ambito_area": {
      "codigo": "PA",
      "descripcion": "Cpl. Murcia"
    },
    "ambito_sector": {
      "codigo": "GE",
      "descripcion": "Cartagena"
    }
  },
  {
    "codigo_centro": "3003",
    "descripcion_centro": "Lorca",
    "responsable": "Lorca CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "P",
      "descripcion": "Murcia"
    },
    "ambito_area": {
      "codigo": "PA",
      "descripcion": "Cpl. Murcia"
    },
    "ambito_sector": {
      "codigo": "GI",
      "descripcion": "Lorca"
    }
  },
  {
    "codigo_centro": "3004",
    "descripcion_centro": "Murcia-2",
    "responsable": "Murcia CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "3101",
    "descripcion_centro": "Pamplona",
    "responsable": "Pamplona CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "O",
      "descripcion": "Navarra"
    },
    "ambito_area": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    },
    "ambito_sector": {
      "codigo": "JH",
      "descripcion": "Pamplona"
    }
  },
  {
    "codigo_centro": "3102",
    "descripcion_centro": "Tudela",
    "responsable": "Tudela CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "O",
      "descripcion": "Navarra"
    },
    "ambito_area": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    },
    "ambito_sector": {
      "codigo": "JS",
      "descripcion": "Tudela"
    }
  },
  {
    "codigo_centro": "3103",
    "descripcion_centro": "Pamplona-2",
    "responsable": "Pamplona CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "O",
      "descripcion": "Navarra"
    },
    "ambito_area": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    },
    "ambito_sector": {
      "codigo": "JH",
      "descripcion": "Pamplona"
    }
  },
  {
    "codigo_centro": "3104",
    "descripcion_centro": "Pamplona-Los Agustinos",
    "responsable": "PAMPLONA-Los Agustinos CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "O",
      "descripcion": "Navarra"
    },
    "ambito_area": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    },
    "ambito_sector": {
      "codigo": "JX",
      "descripcion": "Los Agustinos"
    }
  },
  {
    "codigo_centro": "3201",
    "descripcion_centro": "Ourense",
    "responsable": "Ourense CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "II",
      "descripcion": "Ourense"
    }
  },
  {
    "codigo_centro": "3301",
    "descripcion_centro": "Gijón",
    "responsable": "Gijón CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "E",
      "descripcion": "Asturias"
    },
    "ambito_area": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    },
    "ambito_sector": {
      "codigo": "LC",
      "descripcion": "Gijón"
    }
  },
  {
    "codigo_centro": "3302",
    "descripcion_centro": "Oviedo",
    "responsable": "Oviedo CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "E",
      "descripcion": "Asturias"
    },
    "ambito_area": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    },
    "ambito_sector": {
      "codigo": "LD",
      "descripcion": "Oviedo"
    }
  },
  {
    "codigo_centro": "3303",
    "descripcion_centro": "Avilés",
    "responsable": "Avilés CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "E",
      "descripcion": "Asturias"
    },
    "ambito_area": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    },
    "ambito_sector": {
      "codigo": "LB",
      "descripcion": "Avilés"
    }
  },
  {
    "codigo_centro": "3401",
    "descripcion_centro": "Palencia",
    "responsable": "Palencia CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DG",
      "descripcion": "Palencia"
    }
  },
  {
    "codigo_centro": "3501",
    "descripcion_centro": "Las Palmas",
    "responsable": "Las Palmas CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EB",
      "descripcion": "Las Palmas"
    }
  },
  {
    "codigo_centro": "3502",
    "descripcion_centro": "Gran Canaria Sur",
    "responsable": "Gran Canaria Sur CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "ED",
      "descripcion": "Gran Canaria Sur"
    }
  },
  {
    "codigo_centro": "3503",
    "descripcion_centro": "Lanzarote",
    "responsable": "Lanzarote CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EF",
      "descripcion": "Lanzarote"
    }
  },
  {
    "codigo_centro": "3504",
    "descripcion_centro": "Las Palmas-Puerto de La Luz",
    "responsable": "Las Palmas-Puerto de La Luz CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EG",
      "descripcion": "Puerto de la Luz"
    }
  },
  {
    "codigo_centro": "3506",
    "descripcion_centro": "Telde",
    "responsable": "Telde CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EI",
      "descripcion": "Telde"
    }
  },
  {
    "codigo_centro": "3601",
    "descripcion_centro": "Vigo",
    "responsable": "Vigo CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "IM",
      "descripcion": "Vigo"
    }
  },
  {
    "codigo_centro": "3602",
    "descripcion_centro": "Pontevedra",
    "responsable": "Pontevedra CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "IL",
      "descripcion": "Pontevedra"
    }
  },
  {
    "codigo_centro": "3603",
    "descripcion_centro": "Vilagarcía de Arousa",
    "responsable": "Villagarcía de Arosa CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "IN",
      "descripcion": "Vilagarcía de Arousa"
    }
  },
  {
    "codigo_centro": "3701",
    "descripcion_centro": "Salamanca",
    "responsable": "Salamanca CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DH",
      "descripcion": "Salamanca"
    }
  },
  {
    "codigo_centro": "3801",
    "descripcion_centro": "Tenerife",
    "responsable": "Tenerife CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EC",
      "descripcion": "Tenerife"
    }
  },
  {
    "codigo_centro": "3802",
    "descripcion_centro": "Santa Cruz de La Palma",
    "responsable": "Santa Cruz de la Palma CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EH",
      "descripcion": "Sta. Cruz de la Palma"
    }
  },
  {
    "codigo_centro": "3803",
    "descripcion_centro": "Tenerife-2",
    "responsable": "Tenerife CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EC",
      "descripcion": "Tenerife"
    }
  },
  {
    "codigo_centro": "3804",
    "descripcion_centro": "Tenerife Sur",
    "responsable": "Tenerife Sur CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EE",
      "descripcion": "Tenerife Sur"
    }
  },
  {
    "codigo_centro": "3901",
    "descripcion_centro": "Santander",
    "responsable": "Santander CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "L",
      "descripcion": "Cantabria"
    },
    "ambito_area": {
      "codigo": "LA",
      "descripcion": "Cpl. Cantabria"
    },
    "ambito_sector": {
      "codigo": "JJ",
      "descripcion": "Santander"
    }
  },
  {
    "codigo_centro": "3902",
    "descripcion_centro": "Reinosa",
    "responsable": "Reinosa CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "L",
      "descripcion": "Cantabria"
    },
    "ambito_area": {
      "codigo": "LA",
      "descripcion": "Cpl. Cantabria"
    },
    "ambito_sector": {
      "codigo": "JU",
      "descripcion": "Reinosa"
    }
  },
  {
    "codigo_centro": "4001",
    "descripcion_centro": "Segovia",
    "responsable": "Segovia CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DI",
      "descripcion": "Segovia"
    }
  },
  {
    "codigo_centro": "4101",
    "descripcion_centro": "Sevilla-Cruz del Campo",
    "responsable": "Sevilla CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KL",
      "descripcion": "Sevilla"
    }
  },
  {
    "codigo_centro": "4102",
    "descripcion_centro": "Sevilla-2",
    "responsable": "Sevilla CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "4103",
    "descripcion_centro": "Ecija",
    "responsable": "Ecija CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KO",
      "descripcion": "Écija"
    }
  },
  {
    "codigo_centro": "4104",
    "descripcion_centro": "Sevilla-Cartuja",
    "responsable": "Sevilla CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KL",
      "descripcion": "Sevilla"
    }
  },
  {
    "codigo_centro": "4185",
    "descripcion_centro": "Hospital de día Cartuja",
    "responsable": "HOSPITAL DE DIA CARTUJA_Gerente",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Hospital de día",
    "ambito_comunidad": {
      "codigo": "Z",
      "descripcion": "Hospitales"
    },
    "ambito_area": {
      "codigo": "ZA",
      "descripcion": "Hospitales"
    },
    "ambito_sector": {
      "codigo": "ZS",
      "descripcion": "Hospital de dÃ­a Cartuja"
    }
  },
  {
    "codigo_centro": "4201",
    "descripcion_centro": "Soria",
    "responsable": "Soria CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DJ",
      "descripcion": "Soria"
    }
  },
  {
    "codigo_centro": "4301",
    "descripcion_centro": "Tarragona",
    "responsable": "Tarragona CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "FE",
      "descripcion": "Tarragona"
    }
  },
  {
    "codigo_centro": "4302",
    "descripcion_centro": "Valls",
    "responsable": "Valls CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "FX",
      "descripcion": "Valls"
    }
  },
  {
    "codigo_centro": "4303",
    "descripcion_centro": "Reus",
    "responsable": "Reus CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "FZ",
      "descripcion": "Reus"
    }
  },
  {
    "codigo_centro": "4304",
    "descripcion_centro": "El Vendrell",
    "responsable": "Tarragona CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "PF",
      "descripcion": "El Vendrell"
    }
  },
  {
    "codigo_centro": "4401",
    "descripcion_centro": "Teruel",
    "responsable": "Teruel CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FF",
      "descripcion": "Teruel"
    }
  },
  {
    "codigo_centro": "4403",
    "descripcion_centro": "Alcañiz",
    "responsable": "Alcañiz CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FY",
      "descripcion": "Alcañiz"
    }
  },
  {
    "codigo_centro": "4501",
    "descripcion_centro": "Toledo",
    "responsable": "Toledo CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DK",
      "descripcion": "Toledo"
    }
  },
  {
    "codigo_centro": "4502",
    "descripcion_centro": "Toledo-2",
    "responsable": "Toledo CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "+A",
      "descripcion": "Cpl. Resto Castilla-La Mancha (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "DK",
      "descripcion": "Toledo"
    }
  },
  {
    "codigo_centro": "4503",
    "descripcion_centro": "Talavera de la Reina",
    "responsable": "Talavera de la Reina CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DK",
      "descripcion": "Toledo"
    }
  },
  {
    "codigo_centro": "4601",
    "descripcion_centro": "València-Valencia",
    "responsable": "Valencia CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GN",
      "descripcion": "Valencia-Balears"
    }
  },
  {
    "codigo_centro": "4602",
    "descripcion_centro": "Paterna",
    "responsable": "Paterna CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GO",
      "descripcion": "Paterna"
    }
  },
  {
    "codigo_centro": "4603",
    "descripcion_centro": "Silla",
    "responsable": "Silla CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GP",
      "descripcion": "Silla"
    }
  },
  {
    "codigo_centro": "4604",
    "descripcion_centro": "Gandía",
    "responsable": "Gandía CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GT",
      "descripcion": "Gandía"
    }
  },
  {
    "codigo_centro": "4605",
    "descripcion_centro": "Alzira",
    "responsable": "Alzira CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GS",
      "descripcion": "Alzira"
    }
  },
  {
    "codigo_centro": "4606",
    "descripcion_centro": "València Cid-Valencia Cid",
    "responsable": "Valencia-Cid CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GU",
      "descripcion": "Valencia-Cid"
    }
  },
  {
    "codigo_centro": "4607",
    "descripcion_centro": "Silla-2",
    "responsable": "Silla CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Seguridad e Higiene",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GP",
      "descripcion": "Silla"
    }
  },
  {
    "codigo_centro": "4608",
    "descripcion_centro": "Almussafes",
    "responsable": "Almussafes CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GZ",
      "descripcion": "Almussafes"
    }
  },
  {
    "codigo_centro": "4609",
    "descripcion_centro": "Gandía-2",
    "responsable": "Gandía CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GT",
      "descripcion": "Gandía"
    }
  },
  {
    "codigo_centro": "4676",
    "descripcion_centro": "U3C SURESTE",
    "responsable": "Unidad Central de Contingencias Comunes_UF Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": "Dirección Prestaciones"
    }
  },
  {
    "codigo_centro": "4701",
    "descripcion_centro": "Valladolid",
    "responsable": "Valladolid CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DL",
      "descripcion": "Valladolid"
    }
  },
  {
    "codigo_centro": "4801",
    "descripcion_centro": "Bilbo-Bilbao",
    "responsable": "Bilbao CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JL",
      "descripcion": "Bilbao"
    }
  },
  {
    "codigo_centro": "4802",
    "descripcion_centro": "Portugalete",
    "responsable": "Portugalete CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JN",
      "descripcion": "Portugalete"
    }
  },
  {
    "codigo_centro": "4803",
    "descripcion_centro": "Basauri",
    "responsable": "Basauri CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JP",
      "descripcion": "Basauri"
    }
  },
  {
    "codigo_centro": "4804",
    "descripcion_centro": "Durango",
    "responsable": "Durango CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JT",
      "descripcion": "Durango"
    }
  },
  {
    "codigo_centro": "4871",
    "descripcion_centro": "U3C CENTRO",
    "responsable": "Unidad Central de Contingencias Comunes_UF Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": "Dirección Prestaciones"
    }
  },
  {
    "codigo_centro": "4901",
    "descripcion_centro": "Zamora",
    "responsable": "Zamora CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "DM",
      "descripcion": "Zamora"
    }
  },
  {
    "codigo_centro": "5001",
    "descripcion_centro": "Zaragoza",
    "responsable": "Zaragoza CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FG",
      "descripcion": "Zaragoza"
    }
  },
  {
    "codigo_centro": "5003",
    "descripcion_centro": "Cogullada",
    "responsable": "Cogullada CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FO",
      "descripcion": "Cogullada"
    }
  },
  {
    "codigo_centro": "5004",
    "descripcion_centro": "Utebo",
    "responsable": "Utebo CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FR",
      "descripcion": "Utebo"
    }
  },
  {
    "codigo_centro": "5201",
    "descripcion_centro": "Melilla",
    "responsable": "Melilla CA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Centro Asistencial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KK",
      "descripcion": "Melilla"
    }
  },
  {
    "codigo_centro": "6001",
    "descripcion_centro": "Región Aragón",
    "responsable": "ARAGON DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6002",
    "descripcion_centro": "Región Asturias",
    "responsable": "ASTURIAS DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6003",
    "descripcion_centro": "Región Galicia",
    "responsable": "GALICIA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6004",
    "descripcion_centro": "Región Castilla y León",
    "responsable": "CASTILLA.LEON DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6005",
    "descripcion_centro": "Región Castilla-La Mancha",
    "responsable": "CASTILLA.LA MANCHA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6006",
    "descripcion_centro": "Región País Vasco",
    "responsable": "PAIS VASCO DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6007",
    "descripcion_centro": "Región Andalucía",
    "responsable": "ANDALUCIA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6008",
    "descripcion_centro": "Región Cantabria",
    "responsable": "PAIS VASCO DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6009",
    "descripcion_centro": "Región La Rioja",
    "responsable": "RIOJA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6010",
    "descripcion_centro": "Región Murcia",
    "responsable": "MURCIA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6011",
    "descripcion_centro": "Región Extremadura",
    "responsable": "EXTREMADURA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6012",
    "descripcion_centro": "Región Canarias",
    "responsable": "CANARIAS DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6013",
    "descripcion_centro": "Región Comunidad Valenciana",
    "responsable": "COMUNIDAD VALENCIANA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6016",
    "descripcion_centro": "Región Navarra",
    "responsable": "NAVARRA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6088",
    "descripcion_centro": "Región Instituciones Sanitarias",
    "responsable": "Instituciones Sanitarias",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6101",
    "descripcion_centro": "Región Zona Barcelona",
    "responsable": "BARCELONA DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6102",
    "descripcion_centro": "Región Zona Girona",
    "responsable": "GIRONA DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6103",
    "descripcion_centro": "Región Zona Lleida",
    "responsable": "LLEIDA DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6104",
    "descripcion_centro": "Región Zona Maresme",
    "responsable": "MARESME DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6105",
    "descripcion_centro": "Región Zona Catalunya S.O.",
    "responsable": "CATALUNYA-S.O. DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6106",
    "descripcion_centro": "Región Zona Catalunya Sur",
    "responsable": "CATALUNYA-SUR DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6107",
    "descripcion_centro": "Región Zona Vallés",
    "responsable": "VALLES DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6108",
    "descripcion_centro": "Región Zona Vic",
    "responsable": "VIC DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6109",
    "descripcion_centro": "Región Zona Tarragona",
    "responsable": "TARRAGONA DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6110",
    "descripcion_centro": "Región Zona Catalunya N.O.",
    "responsable": "CATALUNYA-N.O. DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6111",
    "descripcion_centro": "Región Illes Balears",
    "responsable": "BALEARES DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6112",
    "descripcion_centro": "Región Zona Serv. Territoriales",
    "responsable": "CATALUNYA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "6200",
    "descripcion_centro": "Complemento Nacional",
    "responsable": "DIRECCION FINANCIERA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "6211",
    "descripcion_centro": "Dirección Área Andalucía Occidental",
    "responsable": "ANDALUCIA-OCCIDENTAL DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "4A",
      "descripcion": "Cpl. Andalucía Occidental"
    }
  },
  {
    "codigo_centro": "6212",
    "descripcion_centro": "Dirección Área Andalucía Oriental",
    "responsable": "ANDALUCIA-ORIENTAL DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "NA",
      "descripcion": "Cpl. Andalucía Oriental"
    }
  },
  {
    "codigo_centro": "6220",
    "descripcion_centro": "Complemento Área Aragón",
    "responsable": "ARAGON DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    }
  },
  {
    "codigo_centro": "6230",
    "descripcion_centro": "Complemento Área Asturias",
    "responsable": "ASTURIAS DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "E",
      "descripcion": "Asturias"
    },
    "ambito_area": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    },
    "ambito_sector": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    }
  },
  {
    "codigo_centro": "6240",
    "descripcion_centro": "Complemento Área Illes Balears",
    "responsable": "ILLES BALEARS DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    }
  },
  {
    "codigo_centro": "6250",
    "descripcion_centro": "Complemento Área Canarias",
    "responsable": "CANARIAS DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    }
  },
  {
    "codigo_centro": "6260",
    "descripcion_centro": "Complemento Área Cantabria",
    "responsable": "CANTABRIA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "L",
      "descripcion": "Cantabria"
    },
    "ambito_area": {
      "codigo": "LA",
      "descripcion": "Cpl. Cantabria"
    },
    "ambito_sector": {
      "codigo": "LA",
      "descripcion": "Cpl. Cantabria"
    }
  },
  {
    "codigo_centro": "6270",
    "descripcion_centro": "Complemento Área Resto Castilla-La Mancha",
    "responsable": "CASTILLA.LA MANCHA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "+A",
      "descripcion": "Cpl. Resto Castilla-La Mancha (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "+A",
      "descripcion": "Cpl. Resto Castilla-La Mancha"
    }
  },
  {
    "codigo_centro": "6271",
    "descripcion_centro": "Área Ciudad Real",
    "responsable": "CIUDAD REAL DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "ÇA",
      "descripcion": "Ciudad Real (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "ÇA",
      "descripcion": "Cpl. Ciudad Real"
    }
  },
  {
    "codigo_centro": "6272",
    "descripcion_centro": "Complemento Área Castilla-La Mancha",
    "responsable": "CASTILLA.LA MANCHA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    }
  },
  {
    "codigo_centro": "6280",
    "descripcion_centro": "Complemento Área Resto Castilla y León",
    "responsable": "CASTILLA.LEON DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "SA",
      "descripcion": "Cpl. Resto Castilla y León (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "SA",
      "descripcion": "Cpl. Resto Castilla y León"
    }
  },
  {
    "codigo_centro": "6281",
    "descripcion_centro": "Dirección Área Castilla y León Sur",
    "responsable": "CASTILLA.LEON-SUR DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "QA",
      "descripcion": "Castilla y León Sur (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "QA",
      "descripcion": "Cpl. Castilla y León Sur"
    }
  },
  {
    "codigo_centro": "6282",
    "descripcion_centro": "Complemento Área Castilla y León",
    "responsable": "CASTILLA.LEON DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    }
  },
  {
    "codigo_centro": "6291",
    "descripcion_centro": "Dirección Área Barcelona",
    "responsable": "CATALUNYA-BARCELONA DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "FA",
      "descripcion": "Barcelona"
    },
    "ambito_sector": {
      "codigo": "FA",
      "descripcion": "Cpl. Barcelona"
    }
  },
  {
    "codigo_centro": "6292",
    "descripcion_centro": "Dirección Área Catalunya Centro",
    "responsable": "CATALUNYA-CENTRO DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "2A",
      "descripcion": "Catalunya Centro (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "2A",
      "descripcion": "Cpl. Catalunya Centro"
    }
  },
  {
    "codigo_centro": "6293",
    "descripcion_centro": "Dirección Área Catalunya Norte",
    "responsable": "CATALUNYA-NORTE DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "3A",
      "descripcion": "Cpl. Catalunya Norte"
    }
  },
  {
    "codigo_centro": "6294",
    "descripcion_centro": "Dirección Área Catalunya Sur",
    "responsable": "CATALUNYA-SUR DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "1A",
      "descripcion": "Catalunya Sur"
    },
    "ambito_sector": {
      "codigo": "1A",
      "descripcion": "Cpl. Catalunya Sur"
    }
  },
  {
    "codigo_centro": "6300",
    "descripcion_centro": "Complemento Área Resto Comunidad Valenciana",
    "responsable": "COMUNIDAD VALENCIANA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "VA",
      "descripcion": "Cpl. Resto C. Valenciana (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "VA",
      "descripcion": "Cpl. Resto C. Valenciana (EXTINGUIDO)"
    }
  },
  {
    "codigo_centro": "6301",
    "descripcion_centro": "Dirección Área Alicante",
    "responsable": "ALICANTE DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "UA",
      "descripcion": "Alicante"
    },
    "ambito_sector": {
      "codigo": "UA",
      "descripcion": "Cpl. Alicante"
    }
  },
  {
    "codigo_centro": "6302",
    "descripcion_centro": "Dirección Área Valencia - Castellón",
    "responsable": "VALENCIA-CASTELLON DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "XA",
      "descripcion": "Cpl. Valencia - Castellón"
    }
  },
  {
    "codigo_centro": "6310",
    "descripcion_centro": "Complemento Área Extremadura",
    "responsable": "EXTREMADURA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    }
  },
  {
    "codigo_centro": "6320",
    "descripcion_centro": "Complemento Área Resto Galicia",
    "responsable": "GALICIA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "WA",
      "descripcion": "Cpl. Resto Galicia (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "WA",
      "descripcion": "Cpl. Resto Galicia"
    }
  },
  {
    "codigo_centro": "6321",
    "descripcion_centro": "Dirección Área Pontevedra",
    "responsable": "PONTEVEDRA DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "ÑA",
      "descripcion": "Pontevedra (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "ÑA",
      "descripcion": "Cpl. Pontevedra"
    }
  },
  {
    "codigo_centro": "6322",
    "descripcion_centro": "Complemento Área Galicia",
    "responsable": "GALICIA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    }
  },
  {
    "codigo_centro": "6330",
    "descripcion_centro": "Complemento Área La Rioja",
    "responsable": "RIOJA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "M",
      "descripcion": "La Rioja"
    },
    "ambito_area": {
      "codigo": "MA",
      "descripcion": "Cpl. La Rioja"
    },
    "ambito_sector": {
      "codigo": "MA",
      "descripcion": "Cpl. La Rioja"
    }
  },
  {
    "codigo_centro": "6341",
    "descripcion_centro": "Dirección Área Madrid Este",
    "responsable": "MADRID-ESTE DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "5A",
      "descripcion": "Madrid Este (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "5A",
      "descripcion": "Cpl. Madrid Este (EXTINGUIDO)"
    }
  },
  {
    "codigo_centro": "6342",
    "descripcion_centro": "Dirección Área Madrid Centro",
    "responsable": "MADRID-CENTRO DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "6A",
      "descripcion": "Madrid Centro"
    },
    "ambito_sector": {
      "codigo": "6A",
      "descripcion": "Cpl. Madrid Centro"
    }
  },
  {
    "codigo_centro": "6343",
    "descripcion_centro": "Dirección Área Madrid Norte",
    "responsable": "MADRID-NORTE DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "7A",
      "descripcion": "Madrid Norte"
    },
    "ambito_sector": {
      "codigo": "7A",
      "descripcion": "Cpl. Madrid Nordeste"
    }
  },
  {
    "codigo_centro": "6344",
    "descripcion_centro": "Dirección Área Madrid Sur",
    "responsable": "MADRID-SUR DA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "8A",
      "descripcion": "Cpl. Madrid Sur"
    }
  },
  {
    "codigo_centro": "6350",
    "descripcion_centro": "Complemento Área Murcia",
    "responsable": "MURCIA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "P",
      "descripcion": "Murcia"
    },
    "ambito_area": {
      "codigo": "PA",
      "descripcion": "Cpl. Murcia"
    },
    "ambito_sector": {
      "codigo": "PA",
      "descripcion": "Cpl. Murcia"
    }
  },
  {
    "codigo_centro": "6360",
    "descripcion_centro": "Complemento Área Navarra",
    "responsable": "NAVARRA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "O",
      "descripcion": "Navarra"
    },
    "ambito_area": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    },
    "ambito_sector": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    }
  },
  {
    "codigo_centro": "6370",
    "descripcion_centro": "Dirección Área Euskadi Centro",
    "responsable": "PAIS VASCO-CENTRO DA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": ">A",
      "descripcion": "Euskadi Centro (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": ">A",
      "descripcion": "Cpl. Euskadi Centro"
    }
  },
  {
    "codigo_centro": "6380",
    "descripcion_centro": "Dirección Área Hospitales",
    "responsable": "SUBDIRECCION GENERAL AZ_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "Z",
      "descripcion": "Hospitales"
    },
    "ambito_area": {
      "codigo": "ZA",
      "descripcion": "Hospitales"
    },
    "ambito_sector": {
      "codigo": "ZA",
      "descripcion": "Cpl. Hospitales"
    }
  },
  {
    "codigo_centro": "6390",
    "descripcion_centro": "Complemento Área Resto Euskadi",
    "responsable": "PAIS VASCO DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": null,
      "descripcion": null
    },
    "ambito_sector": {
      "codigo": null,
      "descripcion": "Cpl. Resto Euskadi"
    }
  },
  {
    "codigo_centro": "6391",
    "descripcion_centro": "Complemento Área Euskadi",
    "responsable": "PAIS VASCO DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección de Área",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JA",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "7001",
    "descripcion_centro": "Dirección Territorial País Vasco/Cantabria",
    "responsable": "NORESTE DOT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7002",
    "descripcion_centro": "Dirección Territorial Castilla-La Mancha/Murcia",
    "responsable": "MADRID DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7003",
    "descripcion_centro": "Dirección Territorial Catalunya",
    "responsable": "DIRECCION TERRITORIAL CATALUNYA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AQ",
      "descripcion": "Subdirección general Corporativa"
    }
  },
  {
    "codigo_centro": "7004",
    "descripcion_centro": "Dirección Territorial Galicia",
    "responsable": "GALICIA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7005",
    "descripcion_centro": "Territorio Instituciones Sanitarias",
    "responsable": "Territorio",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7006",
    "descripcion_centro": "Territorio Nacional",
    "responsable": ".",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7007",
    "descripcion_centro": "Dirección Territorial Andalucía/Extremadura",
    "responsable": "ANDALUCIA DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7008",
    "descripcion_centro": "Dirección Territorial Canarias",
    "responsable": "CANARIAS DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7009",
    "descripcion_centro": "Dirección Territorial Comunidad de Madrid",
    "responsable": "MADRID DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7010",
    "descripcion_centro": "Dirección Territorial Aragón/La Rioja/Navarra",
    "responsable": "ARAGON DT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7011",
    "descripcion_centro": "Dirección Territorial Asturias/Castilla y León",
    "responsable": "DIRECCION TERRITORIOS A2_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7012",
    "descripcion_centro": "Dirección Territorial Comunidad Valenciana/Illes Balears",
    "responsable": "LEVANTE-BALEARS DOT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "7013",
    "descripcion_centro": "Dirección Territorial Área Norte",
    "responsable": "DIRECCION TERRITORIAL AREA NORTE_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AQ",
      "descripcion": "Subdirección general Territorios"
    }
  },
  {
    "codigo_centro": "7014",
    "descripcion_centro": "Dirección Territorial Área Noroeste",
    "responsable": "DIRECCION TERRITORIAL AREA NOROESTE_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AP",
      "descripcion": "Subdirección General AP"
    }
  },
  {
    "codigo_centro": "7015",
    "descripcion_centro": "Dirección Territorial Área Centro",
    "responsable": "DIRECCION TERRITORIAL AREA CENTRO_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AQ",
      "descripcion": "Subdirección general Corporativa"
    }
  },
  {
    "codigo_centro": "7016",
    "descripcion_centro": "Dirección Territorial Área Sureste",
    "responsable": "DIRECCION TERRITORIAL AREA SURESTE_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AQ",
      "descripcion": "Subdirección general Territorios"
    }
  },
  {
    "codigo_centro": "7200",
    "descripcion_centro": "Complemento Nacional",
    "responsable": "DIRECCION FINANCIERA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "7201",
    "descripcion_centro": "Dirección Autonómica Andalucía",
    "responsable": "ANDALUCIA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "KA",
      "descripcion": "Cpl. Andalucía"
    },
    "ambito_sector": {
      "codigo": "KA",
      "descripcion": "Cpl. Andalucía"
    }
  },
  {
    "codigo_centro": "7202",
    "descripcion_centro": "Dirección Autonómica Aragón",
    "responsable": "ARAGON DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    }
  },
  {
    "codigo_centro": "7203",
    "descripcion_centro": "Dirección Autonómica Asturias",
    "responsable": "ASTURIAS DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "E",
      "descripcion": "Asturias"
    },
    "ambito_area": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    },
    "ambito_sector": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    }
  },
  {
    "codigo_centro": "7204",
    "descripcion_centro": "Dirección Autonómica Illes Balears",
    "responsable": "ILLES BALEARS DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "Y",
      "descripcion": "Illes Balears"
    },
    "ambito_area": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    },
    "ambito_sector": {
      "codigo": "YA",
      "descripcion": "Cpl. Illes Balears"
    }
  },
  {
    "codigo_centro": "7205",
    "descripcion_centro": "Dirección Autonómica Canarias",
    "responsable": "CANARIAS DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    }
  },
  {
    "codigo_centro": "7206",
    "descripcion_centro": "Dirección Autonómica Cantabria",
    "responsable": "CANTABRIA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "L",
      "descripcion": "Cantabria"
    },
    "ambito_area": {
      "codigo": "LA",
      "descripcion": "Cpl. Cantabria"
    },
    "ambito_sector": {
      "codigo": "LA",
      "descripcion": "Cpl. Cantabria"
    }
  },
  {
    "codigo_centro": "7207",
    "descripcion_centro": "Dirección Autonómica Castilla-La Mancha",
    "responsable": "CASTILLA.LA MANCHA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    }
  },
  {
    "codigo_centro": "7208",
    "descripcion_centro": "Dirección Autonómica Castilla y León",
    "responsable": "CASTILLA.LEON DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    },
    "ambito_sector": {
      "codigo": "HA",
      "descripcion": "Cpl. Castilla y León"
    }
  },
  {
    "codigo_centro": "7209",
    "descripcion_centro": "Dirección Autonómica Catalunya",
    "responsable": "CATALUNYA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "BA",
      "descripcion": "Cpl. Catalunya"
    },
    "ambito_sector": {
      "codigo": "BA",
      "descripcion": "Cpl. Catalunya"
    }
  },
  {
    "codigo_centro": "7210",
    "descripcion_centro": "Dirección Autonómica Valencia",
    "responsable": "COMUNIDAD VALENCIANA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Comunidad Valenciana"
    },
    "ambito_area": {
      "codigo": "0A",
      "descripcion": "Cpl. Com. Valenciana"
    },
    "ambito_sector": {
      "codigo": "0A",
      "descripcion": "Cpl. Com. Valenciana"
    }
  },
  {
    "codigo_centro": "7211",
    "descripcion_centro": "Dirección Autonómica Extremadura",
    "responsable": "EXTREMADURA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    }
  },
  {
    "codigo_centro": "7212",
    "descripcion_centro": "Dirección Autonómica Galicia",
    "responsable": "GALICIA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    }
  },
  {
    "codigo_centro": "7213",
    "descripcion_centro": "Dirección Autonómica La Rioja",
    "responsable": "RIOJA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "M",
      "descripcion": "La Rioja"
    },
    "ambito_area": {
      "codigo": "MA",
      "descripcion": "Cpl. La Rioja"
    },
    "ambito_sector": {
      "codigo": "MA",
      "descripcion": "Cpl. La Rioja"
    }
  },
  {
    "codigo_centro": "7214",
    "descripcion_centro": "Dirección Autonómica Madrid",
    "responsable": "MADRID DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "CA",
      "descripcion": "Cpl. Madrid"
    },
    "ambito_sector": {
      "codigo": "CA",
      "descripcion": "Cpl. Madrid"
    }
  },
  {
    "codigo_centro": "7215",
    "descripcion_centro": "Dirección Autonómica Murcia",
    "responsable": "MURCIA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "P",
      "descripcion": "Murcia"
    },
    "ambito_area": {
      "codigo": "PA",
      "descripcion": "Cpl. Murcia"
    },
    "ambito_sector": {
      "codigo": "PA",
      "descripcion": "Cpl. Murcia"
    }
  },
  {
    "codigo_centro": "7216",
    "descripcion_centro": "Dirección Autonómica Navarra",
    "responsable": "NAVARRA DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "O",
      "descripcion": "Navarra"
    },
    "ambito_area": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    },
    "ambito_sector": {
      "codigo": "OA",
      "descripcion": "Cpl. Navarra"
    }
  },
  {
    "codigo_centro": "7217",
    "descripcion_centro": "Dirección Autonómica Euskadi",
    "responsable": "PAIS VASCO DT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    }
  },
  {
    "codigo_centro": "7218",
    "descripcion_centro": "Dirección Autonómica Hospitales",
    "responsable": "SUBDIRECCION GENERAL AZ_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Dirección Autonómica",
    "ambito_comunidad": {
      "codigo": "Z",
      "descripcion": "Hospitales"
    },
    "ambito_area": {
      "codigo": "ZA",
      "descripcion": "Hospitales"
    },
    "ambito_sector": {
      "codigo": "ZA",
      "descripcion": "Cpl. Hospitales"
    }
  },
  {
    "codigo_centro": "7278",
    "descripcion_centro": "U3C NORTE",
    "responsable": "Unidad Central de Contingencias Comunes_UF Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": "Dirección Prestaciones"
    }
  },
  {
    "codigo_centro": "7279",
    "descripcion_centro": "U3C CATALUNYA",
    "responsable": "Unidad Central de Contingencias Comunes_UF Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": "Dirección Prestaciones"
    }
  },
  {
    "codigo_centro": "7280",
    "descripcion_centro": "U3C RETA",
    "responsable": "Unidad Central de Contingencias Comunes_UF Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "7801",
    "descripcion_centro": "Dtor. OrganizaciónTerritorial Andalucía-Extremadura",
    "responsable": "ANDALUCIA-EXTREMADURA DOT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "KA",
      "descripcion": "Cpl. Andalucía"
    },
    "ambito_sector": {
      "codigo": "KA",
      "descripcion": "Cpl. Andalucía"
    }
  },
  {
    "codigo_centro": "7802",
    "descripcion_centro": "Organización Territorial Centro-Sur",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AN",
      "descripcion": "Subdirección General AN"
    }
  },
  {
    "codigo_centro": "7803",
    "descripcion_centro": "Dtor. OrganizaciónTerritorial Levante-Illes Balears",
    "responsable": "LEVANTE-BALEARS DOT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "0A",
      "descripcion": "Cpl. Com. Valenciana"
    },
    "ambito_sector": {
      "codigo": "0A",
      "descripcion": "Cpl. C. Valenciana"
    }
  },
  {
    "codigo_centro": "7804",
    "descripcion_centro": "Dtor. OrganizaciónTerritorial Noreste",
    "responsable": "NORESTE DOT_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Territorial",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "BA",
      "descripcion": "Cpl. Catalunya"
    },
    "ambito_sector": {
      "codigo": "BA",
      "descripcion": "Cpl. Catalunya"
    }
  },
  {
    "codigo_centro": "7805",
    "descripcion_centro": "Organización Territorial Norte",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Organización Territorial",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AP",
      "descripcion": "Subdirección General AP"
    }
  },
  {
    "codigo_centro": "8000",
    "descripcion_centro": "Dirección General",
    "responsable": "DIRECCION GENERAL A0_Dirección",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Dirección General",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "8001",
    "descripcion_centro": "Dirección Financiera",
    "responsable": "DIRECCION FINANCIERA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A6",
      "descripcion": "Dirección Financiera"
    }
  },
  {
    "codigo_centro": "8002",
    "descripcion_centro": "Dirección Asesoría Jurídica",
    "responsable": "DIRECCION ASESORIA JURIDICA A8_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A8",
      "descripcion": "Dirección Asesoría Jurídica"
    }
  },
  {
    "codigo_centro": "8003",
    "descripcion_centro": "Dirección Asistencia Sanitaria",
    "responsable": "DIRECCION ASISTENCIA SANITARIA A9_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": "Dirección Asistencia Sanitaria"
    }
  },
  {
    "codigo_centro": "8004",
    "descripcion_centro": "Dirección Prestaciones Económicas y Sociales",
    "responsable": "DIRECCION PRESTACIONES AL_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "8005",
    "descripcion_centro": "Dirección Infraestructuras y Equipamientos",
    "responsable": "DIRECCION INFRAESTRUCTURAS_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AB",
      "descripcion": "Dirección Infraestructuras y Equipamientos"
    }
  },
  {
    "codigo_centro": "8006",
    "descripcion_centro": "D.P.T.O. Estamentos Oficiales",
    "responsable": ".",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "8007",
    "descripcion_centro": "Dirección Recursos Humanos",
    "responsable": "DIRECCION RECURSOS HUMANOS AC_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AC",
      "descripcion": "Dirección Recursos Humanos"
    }
  },
  {
    "codigo_centro": "8008",
    "descripcion_centro": "Dirección Prevención",
    "responsable": "DIRECCION PREVENCION A3_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A3",
      "descripcion": "Dirección Prevención"
    }
  },
  {
    "codigo_centro": "8010",
    "descripcion_centro": "Dirección Inversiones",
    "responsable": "DIRECCION INVERSIONES_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AI",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "8011",
    "descripcion_centro": "Dirección Cumplimiento y Sostenibilidad",
    "responsable": "DIRECCION CUMPLIMIENTO Y SOSTENIBILIDAD A1_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A1",
      "descripcion": "Dirección Auditoria e Inversiones"
    }
  },
  {
    "codigo_centro": "8012",
    "descripcion_centro": "Coordinación Territorial",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A2",
      "descripcion": "Dirección Territorios"
    }
  },
  {
    "codigo_centro": "8013",
    "descripcion_centro": "Dpto. Servicios Corporativos",
    "responsable": "DIRECCION COMERCIAL_Imagen Corporativa A7IC_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "8014",
    "descripcion_centro": "Dirección Calidad",
    "responsable": "DIRECCION CALIDAD_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A5",
      "descripcion": "Dirección Calidad"
    }
  },
  {
    "codigo_centro": "8015",
    "descripcion_centro": "Dirección Relaciones Externas",
    "responsable": "DIRECCION RELACIONES EXTERNAS_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A7",
      "descripcion": "Dirección Relaciones Externas"
    }
  },
  {
    "codigo_centro": "8016",
    "descripcion_centro": "Dirección Contingencias Comunes",
    "responsable": "DIRECCION CONTINGENCIAS COMUNES AE_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "8018",
    "descripcion_centro": "Dirección Tecnologías de la Información y Comunicación",
    "responsable": "DIRECCION TIC AG_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "8019",
    "descripcion_centro": "Formación y Desarrollo de Proyectos",
    "responsable": "Cpl. Nacional CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "8020",
    "descripcion_centro": "Dirección Servicio de Prevención",
    "responsable": "DIRECCION SERVICIO DE PREVENCION AF_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A0",
      "descripcion": "Dirección General"
    }
  },
  {
    "codigo_centro": "8021",
    "descripcion_centro": "Dirección Contratación",
    "responsable": "DIRECCION CONTRATACION_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AJ",
      "descripcion": "Dirección Contratación"
    }
  },
  {
    "codigo_centro": "8022",
    "descripcion_centro": "Dpto. Estudios y Desarrollo",
    "responsable": "ESTUDIOS Y DESARROLLO AD_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AP",
      "descripcion": "Subdirección General AP"
    }
  },
  {
    "codigo_centro": "8023",
    "descripcion_centro": "Dirección Prestaciones",
    "responsable": "DIRECCION PRESTACIONES AL_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AL",
      "descripcion": "Dirección Prestaciones"
    }
  },
  {
    "codigo_centro": "8024",
    "descripcion_centro": "Dpto. Estamentos Oficiales",
    "responsable": "ESTAMENTOS OFICIALES AI_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AN",
      "descripcion": "Subdirección General AN"
    }
  },
  {
    "codigo_centro": "8025",
    "descripcion_centro": "Dirección Control de Gestión y Auditoría",
    "responsable": "DIRECCION CONTROL GESTION Y AUDITORIA_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AK",
      "descripcion": "Dirección Control de Gestión y Auditoría"
    }
  },
  {
    "codigo_centro": "8026",
    "descripcion_centro": "Dirección de Comunicación",
    "responsable": "DIRECCION MS A7_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Oficinas",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AS",
      "descripcion": "Dirección de Comunicación"
    }
  },
  {
    "codigo_centro": "8027",
    "descripcion_centro": "Servicio de Prevención Propio",
    "responsable": "SERVICIO PREVENCION PROPIO AT_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AT",
      "descripcion": "Servicio Prevención Propio"
    }
  },
  {
    "codigo_centro": "8028",
    "descripcion_centro": "Dirección de Asistencia Social y Cese Actividad Autónomos",
    "responsable": "DIRECCION ASISTENCIA SOCIAL Y AUTÓNOMOS AU_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AU",
      "descripcion": "Dirección de Asistencia Social y Cese Actividad Autónomos."
    }
  },
  {
    "codigo_centro": "8051",
    "descripcion_centro": "Dirección Instalaciones y Equipos",
    "responsable": "DIRECCION INFRAESTRUCTURAS AB_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Direcciones Funcionales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AB",
      "descripcion": "Dirección Instalaciones"
    }
  },
  {
    "codigo_centro": "8801",
    "descripcion_centro": "Secretaría General",
    "responsable": "SECRETARIA GENERAL AM_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AM",
      "descripcion": "Subdirección general Gestión"
    }
  },
  {
    "codigo_centro": "8802",
    "descripcion_centro": "Subdirección general Medios",
    "responsable": "SUBDIRECCION GENERAL AN_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AN",
      "descripcion": "Subdirección general Medios"
    }
  },
  {
    "codigo_centro": "8803",
    "descripcion_centro": "Subdirección General Sistemas de Información",
    "responsable": "GERENCIA SISTEMAS INFORMACION AO_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AO",
      "descripcion": "Subd. Gral. Sistemas de Información (EXTINGUIDO)"
    }
  },
  {
    "codigo_centro": "8804",
    "descripcion_centro": "Subdirección general Económica",
    "responsable": "SUBDIRECCION GENERAL AP_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AP",
      "descripcion": "Subdirección general Económica"
    }
  },
  {
    "codigo_centro": "8805",
    "descripcion_centro": "Subdirección general Corporativa",
    "responsable": "SUBDIRECCION GENERAL AQ_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AQ",
      "descripcion": "Subdirección general Territorios"
    }
  },
  {
    "codigo_centro": "8806",
    "descripcion_centro": "Subdirección General AR",
    "responsable": "SUBDIRECCION GENERAL AR_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AR",
      "descripcion": "Subdirección General AR"
    }
  },
  {
    "codigo_centro": "8807",
    "descripcion_centro": "Subd.Gral. Seguridad e Hig. y Servicio de Prevención",
    "responsable": "GERENCIA SH AH_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AZ",
      "descripcion": "Subd. Gral. Seguridad e Higiene y Sevicio Prevención"
    }
  },
  {
    "codigo_centro": "8808",
    "descripcion_centro": "Subdirección general Sanitaria",
    "responsable": "SUBDIRECCION GENERAL AZ_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización General",
    "tipo_centro": "Subdirecciones Generales",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AZ",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9100",
    "descripcion_centro": "Trabajo domiciliario - Antiguo",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9101",
    "descripcion_centro": "Valdemoro-Aranjuez",
    "responsable": "Valdemoro CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CS",
      "descripcion": "Valdemoro"
    }
  },
  {
    "codigo_centro": "9102",
    "descripcion_centro": "Las Palmas - Consultorio San Roque",
    "responsable": "Las Palmas CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EB",
      "descripcion": "Las Palmas"
    }
  },
  {
    "codigo_centro": "9103",
    "descripcion_centro": "Avilés - Clínica Covadonga",
    "responsable": "Avilés CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "E",
      "descripcion": "Asturias"
    },
    "ambito_area": {
      "codigo": "EA",
      "descripcion": "Cpl. Asturias"
    },
    "ambito_sector": {
      "codigo": "LB",
      "descripcion": "Avilés"
    }
  },
  {
    "codigo_centro": "9104",
    "descripcion_centro": "Almussafes - Parque F.",
    "responsable": "Almussafes CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GZ",
      "descripcion": "Almussafes (EXTINGUIDO)"
    }
  },
  {
    "codigo_centro": "9105",
    "descripcion_centro": "Plasencia - Clínica de Urgencias Placentinas",
    "responsable": "Cáceres CA_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "DD",
      "descripcion": "Cáceres"
    }
  },
  {
    "codigo_centro": "9106",
    "descripcion_centro": "Córdoba - Sanimec Clínicas S.L.",
    "responsable": "Córdoba CA_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "4A",
      "descripcion": "Andalucía Occidental"
    },
    "ambito_sector": {
      "codigo": "KE",
      "descripcion": "Córdoba"
    }
  },
  {
    "codigo_centro": "9107",
    "descripcion_centro": "Móstoles - Clínica Axis S.L.",
    "responsable": "Móstoles CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CH",
      "descripcion": "Móstoles"
    }
  },
  {
    "codigo_centro": "9108",
    "descripcion_centro": "Donostia/San Sebastián - Centro Médico Bidasoa S.A.",
    "responsable": "San Sebastián CA_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "J",
      "descripcion": "Euskadi"
    },
    "ambito_area": {
      "codigo": "JA",
      "descripcion": "Cpl. Euskadi"
    },
    "ambito_sector": {
      "codigo": "JD",
      "descripcion": "San Sebastián"
    }
  },
  {
    "codigo_centro": "9109",
    "descripcion_centro": "Lugo - Fiacro Desarrollo de Iniciativas S.L.",
    "responsable": "Lugo CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "WA",
      "descripcion": "Cpl. Resto Galicia (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "IH",
      "descripcion": "Lugo"
    }
  },
  {
    "codigo_centro": "9110",
    "descripcion_centro": "Valdemoro - Clínica Atlas",
    "responsable": "Valdemoro CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CS",
      "descripcion": "Valdemoro"
    }
  },
  {
    "codigo_centro": "9111",
    "descripcion_centro": "Valladolid - Centro Médico Medina",
    "responsable": "Valladolid CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "H",
      "descripcion": "Castilla y León"
    },
    "ambito_area": {
      "codigo": "SA",
      "descripcion": "Cpl. Resto Castilla y León (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "DL",
      "descripcion": "Valladolid"
    }
  },
  {
    "codigo_centro": "9112",
    "descripcion_centro": "Jaén - Grupo Sanitario Asistencial Hermasalud S.L.",
    "responsable": "Jaén CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "K",
      "descripcion": "Andalucía"
    },
    "ambito_area": {
      "codigo": "NA",
      "descripcion": "Andalucía Oriental"
    },
    "ambito_sector": {
      "codigo": "KH",
      "descripcion": "Jaén"
    }
  },
  {
    "codigo_centro": "9113",
    "descripcion_centro": "Alcañiz - Consulta de Traumatología Dr. Clavero Vicente",
    "responsable": "Alcañiz CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FY",
      "descripcion": "Alcañiz"
    }
  },
  {
    "codigo_centro": "9114",
    "descripcion_centro": "Badajoz - Clínica Vía de la Plata",
    "responsable": "Badajoz CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "R",
      "descripcion": "Extremadura"
    },
    "ambito_area": {
      "codigo": "RA",
      "descripcion": "Cpl. Extremadura"
    },
    "ambito_sector": {
      "codigo": "DC",
      "descripcion": "Badajoz"
    }
  },
  {
    "codigo_centro": "9115",
    "descripcion_centro": "Vic - Centre Mèdic Manlleu",
    "responsable": "Vic CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BT",
      "descripcion": "Vic"
    }
  },
  {
    "codigo_centro": "9116",
    "descripcion_centro": "A Coruña - Clínica Médica Compostela S.L.",
    "responsable": "Santiago de Compostela CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "WA",
      "descripcion": "Cpl. Resto Galicia (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "IP",
      "descripcion": "Santiago de Compostela"
    }
  },
  {
    "codigo_centro": "9117",
    "descripcion_centro": "Gandía - Clínica de Especialistas C.B.",
    "responsable": "Gandía CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Valencia - Murcia"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GT",
      "descripcion": "Gandía"
    }
  },
  {
    "codigo_centro": "9118",
    "descripcion_centro": "Valencia Cid - Servicios Asistenciales El Remedio, S.L",
    "responsable": "Valencia-Cid CA_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "Valencia - Murcia"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GU",
      "descripcion": "Valencia-Cid"
    }
  },
  {
    "codigo_centro": "9119",
    "descripcion_centro": "Valdemoro - Clínica Centro Sur Servicios Generales S.L.",
    "responsable": "Valdemoro CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CS",
      "descripcion": "Valdemoro"
    }
  },
  {
    "codigo_centro": "9120",
    "descripcion_centro": "Alcañiz - Centro Médico Alcañiz, S.L.P.",
    "responsable": "Alcañiz CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "D",
      "descripcion": "Aragón"
    },
    "ambito_area": {
      "codigo": "DA",
      "descripcion": "Cpl. Aragón"
    },
    "ambito_sector": {
      "codigo": "FY",
      "descripcion": "Alcañiz"
    }
  },
  {
    "codigo_centro": "9121",
    "descripcion_centro": "Vic - Centre Mèdic del Ges, S.L.",
    "responsable": "Vic CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "BT",
      "descripcion": "Vic"
    }
  },
  {
    "codigo_centro": "9122",
    "descripcion_centro": "Valencia - Centre Médic Clinica Jaime I - Torrellano",
    "responsable": "Valencia CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GN",
      "descripcion": "Valencia-Balears"
    }
  },
  {
    "codigo_centro": "9123",
    "descripcion_centro": "Valencia - Centre Médic Clínica Jaime I - Catarroja",
    "responsable": "Valencia CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GN",
      "descripcion": "Valencia-Balears"
    }
  },
  {
    "codigo_centro": "9124",
    "descripcion_centro": "Valencia - Centre Médic Clínica Jaime I - Puerto Sagunto",
    "responsable": "Valencia CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GN",
      "descripcion": "Valencia-Balears"
    }
  },
  {
    "codigo_centro": "9125",
    "descripcion_centro": "Valencia - Centre Médic Clínica Jaime I - Valencia",
    "responsable": "Valencia CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GN",
      "descripcion": "Valencia-Balears"
    }
  },
  {
    "codigo_centro": "9126",
    "descripcion_centro": "Valencia - Clínica Jaime I - San Lázaro, S.L. - Villena",
    "responsable": "Valencia CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "XA",
      "descripcion": "Valencia - Castellón"
    },
    "ambito_sector": {
      "codigo": "GN",
      "descripcion": "Valencia-Balears"
    }
  },
  {
    "codigo_centro": "9127",
    "descripcion_centro": "Toledo - Clínica Marazuela, S.A.",
    "responsable": "Toledo CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "+A",
      "descripcion": "Cpl. Resto Castilla-La Mancha (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "DK",
      "descripcion": "Toledo"
    }
  },
  {
    "codigo_centro": "9128",
    "descripcion_centro": "Elche - Clínica Ceade Almoradi, S.L.",
    "responsable": "Elche CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "0",
      "descripcion": "C. Valenciana"
    },
    "ambito_area": {
      "codigo": "UA",
      "descripcion": "Alicante"
    },
    "ambito_sector": {
      "codigo": "GH",
      "descripcion": "Elche"
    }
  },
  {
    "codigo_centro": "9129",
    "descripcion_centro": "Lalín - Centro Médico Asistencial Lalín, S.L.",
    "responsable": "Pontevedra CA_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": "Galicia"
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "IL",
      "descripcion": "Pontevedra"
    }
  },
  {
    "codigo_centro": "9130",
    "descripcion_centro": "Toledo - Dr. Julián Armando Martín Capilla",
    "responsable": "Toledo CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "IA",
      "descripcion": "Cpl. Castilla-La Mancha"
    },
    "ambito_sector": {
      "codigo": "DK",
      "descripcion": "Toledo"
    }
  },
  {
    "codigo_centro": "9131",
    "descripcion_centro": "Valdemoro - Clínica Richer, S.L.",
    "responsable": "Valdemoro CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": "Madrid"
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CS",
      "descripcion": "Valdemoro"
    }
  },
  {
    "codigo_centro": "9132",
    "descripcion_centro": "Talavera de la Reina - Ibermutuamur",
    "responsable": "Toledo CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "I",
      "descripcion": "Castilla-La Mancha"
    },
    "ambito_area": {
      "codigo": "+A",
      "descripcion": "Cpl. Resto Castilla-La Mancha (EXTINGUIDO)"
    },
    "ambito_sector": {
      "codigo": "DK",
      "descripcion": "Toledo"
    }
  },
  {
    "codigo_centro": "9133",
    "descripcion_centro": "Santa Cruz de la Palma - Centro Médico Tinabana, S.L.",
    "responsable": "Santa Cruz de la Palma CA_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "T",
      "descripcion": "Canarias"
    },
    "ambito_area": {
      "codigo": "TA",
      "descripcion": "Cpl. Canarias"
    },
    "ambito_sector": {
      "codigo": "EH",
      "descripcion": "Sta. Cruz de la Palma"
    }
  },
  {
    "codigo_centro": "9134",
    "descripcion_centro": "Palamós - Centre d'Especialitats Mèdiques, S.L.",
    "responsable": "Palamos CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "B",
      "descripcion": "Catalunya"
    },
    "ambito_area": {
      "codigo": "3A",
      "descripcion": "Catalunya Norte"
    },
    "ambito_sector": {
      "codigo": "FM",
      "descripcion": "Palamós"
    }
  },
  {
    "codigo_centro": "9135",
    "descripcion_centro": "Valdemoro-Servicios Sanitarios y Parasanitarios, S.L.",
    "responsable": "Valdemoro CA_Director",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Concertado",
    "ambito_comunidad": {
      "codigo": "C",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "8A",
      "descripcion": "Madrid Sur"
    },
    "ambito_sector": {
      "codigo": "CS",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9200",
    "descripcion_centro": "Telediagnóstico",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9201",
    "descripcion_centro": "Coordinación médica",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9202",
    "descripcion_centro": "Teleconsulta",
    "responsable": "DIRECCION ASISTENCIA SANITARIA A9_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A9",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9300",
    "descripcion_centro": "Instituto Nacional de la Seguridad Social",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9301",
    "descripcion_centro": "Asepeyo - Mutua Balear",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9302",
    "descripcion_centro": "Asepeyo - Mutua Fraternidad",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9303",
    "descripcion_centro": "Asepeyo - Mutua MC Mutual",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9304",
    "descripcion_centro": "Asepeyo - Mutua MAC",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9305",
    "descripcion_centro": "Asepeyo - Mutua Ibermutua",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9306",
    "descripcion_centro": "Asepeyo - Unión de Mutuas",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9307",
    "descripcion_centro": "Asepeyo - Mutua Montañesa",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9308",
    "descripcion_centro": "Asepeyo - Umivale Activa",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9309",
    "descripcion_centro": "Asepeyo - CESMA",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9310",
    "descripcion_centro": "Asepeyo - Mutua Universal MUGENAT",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9311",
    "descripcion_centro": "Asepeyo - Mutua Gallega",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "G",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "GA",
      "descripcion": "Cpl. Galicia"
    },
    "ambito_sector": {
      "codigo": "ID",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9312",
    "descripcion_centro": "Asepeyo - Mutualia",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9313",
    "descripcion_centro": "Asepeyo - Mutua Navarra",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9314",
    "descripcion_centro": "Asepeyo - Mutua Intercomarcal",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9315",
    "descripcion_centro": "Asepeyo - Mutua Egarsat",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9316",
    "descripcion_centro": "Asepeyo - Mutua Fremap",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9317",
    "descripcion_centro": "Asepeyo - Mutua MAZ",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Mutua Concertada",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9400",
    "descripcion_centro": "Portal Box Asepeyo",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9600",
    "descripcion_centro": "TIC Asignación personal de activos TIC",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "9666",
    "descripcion_centro": "TIC Asignación Personal - Domicilio",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9701",
    "descripcion_centro": "DIE - Mantenedores Externos Master Tools",
    "responsable": "DIRECCION INFRAESTRUCTURAS_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "9702",
    "descripcion_centro": "DIE - Mantenedores Externos Master Tools Hospital Coslada",
    "responsable": "DIRECCION INFRAESTRUCTURAS_Director",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    }
  },
  {
    "codigo_centro": "9900",
    "descripcion_centro": "Mantenimiento",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9901",
    "descripcion_centro": "Centro itinerante TIC",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9902",
    "descripcion_centro": "C.A. PRUEBAS. 2",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "INACTIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9903",
    "descripcion_centro": "Proveedores Externos",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9904",
    "descripcion_centro": "Pruebas-Metodología y Calidad",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Centro Asistencial Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección Sistemas de Información"
    }
  },
  {
    "codigo_centro": "9905",
    "descripcion_centro": "Chat Virtual Asepeyo",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "A7",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9906",
    "descripcion_centro": "Centro RPA",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "OPERATIVO",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Virtual",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9971",
    "descripcion_centro": "Depósito TIC Externo - Vimifar",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9972",
    "descripcion_centro": "Depósito TIC Externo - VINZEO",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9973",
    "descripcion_centro": "Depósito TIC Interno",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9974",
    "descripcion_centro": "Depósito externo - Aliance Brother",
    "responsable": "DIRECCION FINANCIERA_Director",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AJ",
      "descripcion": "Dirección Compras"
    }
  },
  {
    "codigo_centro": "9975",
    "descripcion_centro": "Depósito TIC Externo - Canon",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9976",
    "descripcion_centro": "Depósito TIC Externo - EVOLUTIO",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": null
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": null
    }
  },
  {
    "codigo_centro": "9977",
    "descripcion_centro": "Almacén TIC",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9988",
    "descripcion_centro": "Depósito TIC solicitud bajas",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  },
  {
    "codigo_centro": "9999",
    "descripcion_centro": "Depósito TIC no instalables",
    "responsable": "DIRECCION TIC AG_Administrador",
    "estado": "EN CONSTRUCCIÓN",
    "organizacion": "Organización Auxiliar",
    "tipo_centro": "Local Auxiliar",
    "ambito_comunidad": {
      "codigo": "A",
      "descripcion": "Nacional"
    },
    "ambito_area": {
      "codigo": "AA",
      "descripcion": "Cpl. Nacional"
    },
    "ambito_sector": {
      "codigo": "AG",
      "descripcion": "Dirección TIC"
    }
  }
] as const;

