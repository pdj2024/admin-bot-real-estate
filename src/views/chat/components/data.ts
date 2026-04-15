export interface Catalogue {
  name: string
  price: string
  location: string
  type: string
  dimensi: string
  landSize: number
  buildingSize: number
  floors: number
  bedrooms: number
  bathrooms: number
  diningRoom: number
  car: number
  image: string
  colorClass: string
}


export interface CalendarEvent {
  title: string
  start: Date
  extendedProps: {
    time: string
    location: string
    customer: string
    customer_phone: string
    salesman: string
    salesman_phone: string
    picture: string
    property: string
    type: number
    lb: number
    lt: number
    carport: number
    jmlLt: number
    kt: number
    wc: number
  }
}

export interface Appointment {
  date: string
  time: string
  location: string
  customerName: string
  customerPhone: string
  salesName: string
  salesPhone: string
  image: string
  propertyName: string
  type: number
  buildingSize: number
  landSize: number
  floors: number
  carport: number
  bed: number
  bath: number
}

export interface Chat {
  // ==== EXISTING ====
  Message_Id: string
  Room_Id: string
  Sender_Id: string
  Tipe_User: string
  Message: string
  Jenis_Pesan: string
  Id_Paket: string | null
  No_Pesanan: string | null
  Sent_At: Date
  Edited_At?: Date | null
  User_Ids: string[]
  Room_Type: string
  Status: string
  Send_Status: string
  No_Penawaran: string
  Receiver_Ids: string[]

  Room_Name?: string
  Username_User?: string
  Nama_Display_User?: string
  Id_User?: string
  Id_Media_User?: string
  No_Id_Media_User?: string
  Telepon_User?: string
  Username_Lawan?: string
  Nama_Display_Lawan?: string
  Id_Lawan?: string
  Id_Media_Lawan?: string
  No_Id_Media_Lawan?: string
  Tipe_User_Lawan?: string
  Telepon_User_Lawan?: string
  Created_At?: Date | null
  Last_Message_At?: Date | string
  Last_Message?: string
  Count_Status_Sent?: number
  List_Id_Message_Sent?: string[]
  Count_Status_Received?: number
  List_Id_Message_Received?: string[]
  Media_Url?: string
}

export interface PreviewImage {
  id: string;
  url: string;
  file: File;
  caption: string;
}

export const catalogueData: Catalogue[] = [
  {
    name: 'Griya Modern Cluster',
    price: '545.000.000',
    location: 'Sidoarjo, Jawa Timur',
    type: '35/60',
    dimensi: '6 x 10 m',
    landSize: 60,
    buildingSize: 35,
    floors: 2,
    bedrooms: 2,
    bathrooms: 1,
    diningRoom: 1,
    car: 1,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600&auto=format&fit=crop',
    colorClass: 'indigo'
  },
  {
    name: 'Modern House Emerald',
    price: '785.000.000',
    location: 'Malang, Jawa Timur',
    type: '45/84',
    dimensi: '7 x 12 m',
    landSize: 84,
    buildingSize: 45,
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    diningRoom: 1,
    car: 1,
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=600&auto=format&fit=crop',
    colorClass: 'emerald'
  },
  {
    name: 'Premium Skyline Villa',
    price: '1.250.000.000',
    location: 'Surabaya, Jawa Timur',
    type: '70/120',
    dimensi: '8 x 15 m',
    landSize: 120,
    buildingSize: 70,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    diningRoom: 1,
    car: 2,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    colorClass: 'rose'
  },
]

export const calendarEvents: CalendarEvent[] = [
  {
    title: 'P. Budi - Griya Asri Residence',
    start: new Date('2026-03-10T12:00:00'),
    extendedProps: {
      time: '12:00',
      location: 'Jl Hidup Liku-liku, Surabaya',
      customer: 'Budi Santoso',
      customer_phone: '0873482453534',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://media.dekoruma.com/article/2024/10/30201434/Model-Rumah-Modern-Minimalis.jpg?resize=800%2C600&ssl=1',
      property: 'Griya Asri Residence',
      type: 45,
      lb: 45,
      lt: 60,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'P. Herman - Griya Asri Residence',
    start: new Date('2026-03-11T10:30:00'),
    extendedProps: {
      time: '10:30',
      location: 'Jl Raya Darmo, Surabaya',
      customer: 'Herman Wijaya',
      customer_phone: '081233445566',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://cdn1-production-images-kly.akamaized.net/7jfLlyvz6P_0Dh-KvXCFs5tf5jc=/1280x720/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5214975/original/088768800_1746786001-7ba6160f-c619-4160-8633-7f463565afca.jpg',
      property: 'Griya Asri Residence',
      type: 45,
      lb: 45,
      lt: 72,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'P. Siti - Green Lake Residence',
    start: new Date('2026-03-12T09:00:00'),
    extendedProps: {
      time: '09:00',
      location: 'Jl Ahmad Yani, Surabaya',
      customer: 'Siti Rahma',
      customer_phone: '081311223344',
      salesman: 'Bima Kurniawan',
      salesman_phone: '081355667788',
      picture: 'https://static.promediateknologi.id/crop/0x28:1143x716/0x0/webp/photo/p2/239/2025/02/06/desain-rumah-minimalis-tahun-2024-1452919504.jpg',
      property: 'Green Lake Residence',
      type: 60,
      lb: 60,
      lt: 90,
      carport: 1,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'P. Dodi - Green Lake Residence',
    start: new Date('2026-03-13T13:00:00'),
    extendedProps: {
      time: '13:00',
      location: 'Jl Ketintang, Surabaya',
      customer: 'Dodi Kurniawan',
      customer_phone: '082155667788',
      salesman: 'Bima Kurniawan',
      salesman_phone: '081355667788',
      picture: 'https://sn-studio.id/wp-content/uploads/2025/11/rumah-minimalis-sederhana-pak-joko.jpg',
      property: 'Green Lake Residence',
      type: 70,
      lb: 70,
      lt: 100,
      carport: 2,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'B. Rina - Bukit Indah Residence',
    start: new Date('2026-03-14T11:00:00'),
    extendedProps: {
      time: '11:00',
      location: 'Jl Manyar, Surabaya',
      customer: 'Rina Putri',
      customer_phone: '081299887766',
      salesman: 'Yeni Anggraeni',
      salesman_phone: '081355667788',
      picture: 'https://www.emporioarchitect.com/img/blog/mengenal-lebih-dekat-mengenai-desain-rumah-minimalis-230622011359661434.jpg',
      property: 'Bukit Indah Residence',
      type: 45,
      lb: 45,
      lt: 65,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'P. Agus - Bukit Indah Residence',
    start: new Date('2026-03-15T15:00:00'),
    extendedProps: {
      time: '15:00',
      location: 'Jl Merr, Surabaya',
      customer: 'Agus Salim',
      customer_phone: '082233441122',
      salesman: 'Yeni Anggraeni',
      salesman_phone: '081355667788',
      picture: 'https://i0.wp.com/www.emporioarchitect.com/upload/portofolio/1280/desain-rumah-modern-2-setengah-lantai-24131022-85791957131022093203-0.jpg',
      property: 'Bukit Indah Residence',
      type: 60,
      lb: 60,
      lt: 84,
      carport: 1,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'P. Fajar - Grand Taman Residence',
    start: new Date('2026-03-16T09:30:00'),
    extendedProps: {
      time: '09:30',
      location: 'Jl Ahmad Dahlan, Sidoarjo',
      customer: 'Fajar Nugroho',
      customer_phone: '087811223344',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWQq8cL70yyFxVkLMaLVPFOXby-Ra7iGQOug&s',
      property: 'Grand Taman Residence',
      type: 50,
      lb: 50,
      lt: 70,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'B. Maya - Grand Taman Residence',
    start: new Date('2026-03-17T14:00:00'),
    extendedProps: {
      time: '14:00',
      location: 'Jl Taman Sari, Sidoarjo',
      customer: 'Maya Sari',
      customer_phone: '081266778899',
      salesman: 'Bima Kurniawan',
      salesman_phone: '081355667788',
      picture: 'https://asset2.morefurniture.id/NEWS/2025/2/Rumah%20Minimalis%20dengan%20Atap%20Skillion%20Ganda.jpg',
      property: 'Grand Taman Residence',
      type: 65,
      lb: 65,
      lt: 95,
      carport: 2,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'P. Joko - Permata Indah Residence',
    start: new Date('2026-03-18T10:00:00'),
    extendedProps: {
      time: '10:00',
      location: 'Jl Diponegoro, Surabaya',
      customer: 'Joko Susilo',
      customer_phone: '081355667788',
      salesman: 'Yeni Anggraeni',
      salesman_phone: '081355667788',
      picture: 'https://arsitekmasterpiece.co.id/wp-content/uploads/2024/09/Model-Rumah-Minimalis-Sederhana-di-Desa.jpg',
      property: 'Permata Indah Residence',
      type: 45,
      lb: 45,
      lt: 60,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'B. Lina - Permata Indah Residence',
    start: new Date('2026-03-19T16:00:00'),
    extendedProps: {
      time: '16:00',
      location: 'Jl Rungkut, Surabaya',
      customer: 'Lina Marlina',
      customer_phone: '082199887766',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwYgootRmQUBlII_rMpvQEM4KOm2D9bkS8dw&s',
      property: 'Permata Indah Residence',
      type: 70,
      lb: 70,
      lt: 110,
      carport: 2,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  }
]

export const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🏠', '🏡', '🏢', '🏢', '🏗️', '🏘️', '🏙️', '🌇', '💰', '💵', '💳', '✨', '⭐', '🔥', '✅', '❌', '⚠️', '📍', '📞'
]
