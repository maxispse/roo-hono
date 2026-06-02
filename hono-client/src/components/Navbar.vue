<template>
  <div class="flex items-start w-full bg-[#D9D9D9] dark:bg-gray-700 top-0 h-screen sticky">
    <RouterLink to="/">
    <img 
      src="../assets/ScrollTubeLogo.png"
      class="w-[128px] h-[128px] block top-0 sticky"
    />
    </RouterLink>
    <div class="flex flex-row gap-2 mt-10 ml-8">
      <h1 class="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent hidden sm:text-4xl">ScrollTube</h1>
      <div class="w-[2px] h-[32px]  ml-150 g-4">
        <input type="text" class="w-50 h-10 border-2  text-[#CB3939] text-sm bg-white rounded dark:bg-gray-500 text-white" placeholder="Search..." />
      </div>
    </div>

    <div class="flex flex-row gap-4 ml-auto mt-10 mr-8">
       <RouterLink to="/login">
      <img src="../assets/image copy.png" class="w-[64px] h-[64px] rounded-2xl" />
    </RouterLink>
    </div>
  </div>
</template>