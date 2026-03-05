apa bisa isi chat ini menjadi modular? jadi tinggal panggil function saja untuk setiap kali menampilkan buble chat
<template>
  <simplebar class="h-[calc(100vh-340px)]" data-simplebar>
      <div class="card-body bg-default-50">
        <div class="flex flex-col gap-5">
          <div class="flex gap-3 items-end">
            <RouterLink to="#" class="flex items-center justify-center text-sm font-semibold rounded-full size-9 bg-default-200">
              <img :src="user2" alt="" class="object-cover rounded-full h-9" />
            </RouterLink>
            <div class="p-4 card text-default-700 text-sm">Apakah disini tersedia pasir bangunan?</div>
          </div>
          <div class="flex gap-3 justify-end items-end">
            <div class="w-92 p-4 card text-default-700">
              <span>Hi <b>Budi Galangan!</b></span>
              Anda datang di waktu yang tepat. Silahkan deskripsikan produk yang Anda cari.
              <br /><br />
              <span class="text-default-400 text-sm">Dikirim oleh Asisten AI Chat</span>
            </div>
            <RouterLink to="" class="flex items-center justify-center text-sm font-semibold rounded-full size-10 bg-default-200">
              <!-- <Icon icon="lucide:headset" class="size-5 flex items-center text-default-500"></Icon> -->
              <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div>
            </RouterLink>
          </div>
          <div class="flex gap-3 items-end">
            <div>
              <RouterLink to="#" class="flex items-center justify-center text-sm font-semibold rounded-full size-9 bg-default-200">
                <img :src="user2" alt="" class="object-cover rounded-full h-9" />
              </RouterLink>
            </div>
            <div class="flex flex-col gap-3">
              <div class="w-92 p-4 card">
                <div class="text-default-700 text-sm">Saya butuh pasir yang cocok untuk kebutuhan cor dak</div>
                <div class="grid grid-cols-3 gap-4 mt-4">
                  <RouterLink to="#">
                    <img :src="rumah1" alt="" class="rounded-md" />
                  </RouterLink>
                  <RouterLink to="#">
                    <img :src="rumah2" alt="" class="rounded-md" />
                  </RouterLink>
                </div>
              </div>
              <div class="w-auto p-4 card text-default-700 text-sm">Rencananya untuk 2 lantai.</div>
              <div class="w-92 p-4 card text-default-700 text-sm">Kira-kira pakai pasir apa ya yang cocok?</div>
            </div>
          </div>
          <div class="flex gap-3 justify-end items-end">
            <div class="flex flex-col gap-3 items-end">
              <div class="w-92 p-4 card text-default-700 text-sm">
                Baik Budi, saya mengerti kendala yang kamu alami. Berikut saya sarankan beberapa pilihan produk yang mungkin cocok untuk kebutuhan Anda <br /><br />
                <span class="text-default-400 text-sm">Dikirim oleh Asisten AI Chat</span>
              </div>
              <div class="w-110 grid grid-cols-3 gap-2">
                <!-- Produk 1 -->
                <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 cursor-pointer">
                  <img :src="pasir1" class="w-full h-28 object-cover rounded-lg mb-3" />

                  <h6 class="text-sm font-semibold text-default-800 line-clamp-2">Pasir Biasa</h6>

                  <p class="text-primary font-bold mt-1">Rp 250.000</p>
                </div>

                <!-- Produk 2 -->
                <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 cursor-pointer">
                  <img :src="pasir2" class="w-full h-28 object-cover rounded-lg mb-3" />

                  <h6 class="text-sm font-semibold text-default-800 line-clamp-2">Pasir Merah</h6>

                  <p class="text-primary font-bold mt-1">Rp 230.000</p>
                </div>

                <!-- Produk 3 -->
                <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 cursor-pointer">
                  <img :src="pasir3" class="w-full h-28 object-cover rounded-lg mb-3" />

                  <h6 class="text-sm font-semibold text-default-800 line-clamp-2">Pasir Lumajang</h6>

                  <p class="text-primary font-bold mt-1">Rp 200.000</p>
                </div>
              </div>
            </div>
            <div>
              <RouterLink to="" class="flex items-center justify-center text-sm font-semibold rounded-full size-10 bg-default-200">
                <!-- <Icon icon="lucide:headset" class="size-5 flex items-center text-default-500"></Icon> -->
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div>
              </RouterLink>
            </div>
          </div>
          <div class="flex gap-3 items-end">
            <RouterLink to="#" class="flex items-center justify-center text-sm font-semibold rounded-full size-9 bg-default-200">
              <img :src="user2" alt="" class="object-cover rounded-full h-9" />
            </RouterLink>
            <div class="w-92 p-4 card text-default-700 text-sm">Wah pilihan yang banyak sekali, saya jadi bingung</div>
          </div>
          <div class="flex gap-3 justify-end items-end">
            <div class="w-92 p-4 card text-default-700 text-sm">
              Mohon maaf atas kendala yang bapak alami, mau saya sambungkan ke customer service kami? <br /><br />
              <span class="text-default-400 text-sm">Dikirim oleh Asisten AI Chat</span>
            </div>

            <RouterLink to="" class="flex items-center justify-center text-sm font-semibold rounded-full size-10 bg-default-200">
              <!-- <Icon icon="lucide:headset" class="size-5 flex items-center text-default-500"></Icon> -->
              <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div>
            </RouterLink>
          </div>

          <div class="flex gap-3 items-end">
            <RouterLink to="#" class="flex items-center justify-center text-sm font-semibold rounded-full size-9 bg-default-200">
              <img :src="user2" alt="" class="object-cover rounded-full h-9" />
            </RouterLink>
            <div class="w-92 p-4 card text-default-700 text-sm">Ya</div>
          </div>

          <div class="flex gap-3 justify-end items-end">
            <div class="w-92 p-4 card text-default-700 text-sm">
              Mohon menunggu, Anda sedang dalam antrian customer service ke-9<br /><br />
              <span class="text-default-400 text-sm">Dikirim oleh Asisten AI Chat</span>
            </div>

            <RouterLink to="" class="flex items-center justify-center text-sm font-semibold rounded-full size-10 bg-default-200">
              <!-- <Icon icon="lucide:headset" class="size-5 flex items-center text-default-500"></Icon> -->
              <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div>
            </RouterLink>
          </div>

          <div class="flex gap-3 justify-end items-end">
            <div class="w-92 p-4 card text-default-700 text-sm">Selamat siang, dengan Maya disini. Ada yang bisa saya bantu?<br /><br />- Maya</div>

            <RouterLink to="" class="flex items-center justify-center text-sm font-semibold rounded-full size-10 bg-default-200">
              <Icon icon="lucide:headset" class="size-5 flex items-center text-default-500"></Icon>
              <!-- <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div> -->
            </RouterLink>
          </div>
        </div>
      </div>
    </simplebar>
</template>
