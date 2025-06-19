<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md w-full sm:w-auto"
        @click="openCreateModal">
        เพิ่มหนังสือ
      </button>
      <h1 class="text-2xl font-bold text-gray-800 text-center w-full sm:w-auto">Books</h1>
      <button class="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md w-full sm:w-auto"
        @click="handleLogout">
        Logout
      </button>
    </header>

    <!-- Alert Modal -->
    <div v-if="alertMessage" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div class="bg-green-500 text-white px-6 py-3 rounded shadow-lg">
        {{ alertMessage }}
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>

    <!-- Book Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full table-auto text-sm border border-gray-200 rounded-lg shadow">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="px-4 py-2 text-left">No.</th>
            <th class="px-4 py-2 text-left">Title</th>
            <th class="px-4 py-2 text-left">Author</th>
            <th class="px-4 py-2 text-left">Published Year</th>
            <th class="px-4 py-2 text-left">Genre</th>
            <th class="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id" class="hover:bg-gray-50 border-t border-gray-200">
            <td class="px-4 py-2">{{ book.id }}</td>
            <td class="px-4 py-2">{{ book.title }}</td>
            <td class="px-4 py-2">{{ book.author }}</td>
            <td class="px-4 py-2">{{ book.published_year || '-' }}</td>
            <td class="px-4 py-2">{{ book.genre || '-' }}</td>
            <td class="px-4 py-2 space-x-2 min-w-[220px]">
              <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                @click="openDetailModal(book)">ดูรายละเอียด</button>
              <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                @click="startEdit(book)">แก้ไข</button>
              <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                @click="openConfirmModal(book.id)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex flex-wrap justify-center items-center gap-4 mt-6 text-sm">
        <button class="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400" :disabled="page === 1"
          @click="changePage(page - 1)">ก่อนหน้า</button>
        <span>หน้า {{ page }} / {{ totalPages }}</span>
        <button class="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400" :disabled="page === totalPages"
          @click="changePage(page + 1)">ถัดไป</button>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 class="text-lg font-semibold mb-4">ยืนยันการลบ</h2>
        <p class="mb-4 text-sm text-gray-600">คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือเล่มนี้?</p>
        <div class="flex justify-end gap-2">
          <button @click="confirmDelete" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">ลบ</button>
          <button @click="cancelDelete" class="bg-gray-500 text-white px-4 py-2 rounded">ยกเลิก</button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="detailBook || editingBook || creatingBook"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <template v-if="detailBook">
          <h2 class="text-xl font-semibold mb-4">รายละเอียดหนังสือ</h2>
          <p class="mb-2"><strong>Title:</strong> {{ detailBook.title }}</p>
          <p class="mb-2"><strong>Author:</strong> {{ detailBook.author }}</p>
          <p class="mb-2"><strong>Published Year:</strong> {{ detailBook.published_year || '-' }}</p>
          <p class="mb-4"><strong>Genre:</strong> {{ detailBook.genre || '-' }}</p>
          <button class="bg-gray-600 text-white px-4 py-2 rounded w-full" @click="closeDetailModal">ปิด</button>
        </template>

        <template v-if="editingBook">
          <h2 class="text-xl font-semibold mb-4">แก้ไขหนังสือ</h2>
          <form @submit.prevent="submitEdit" class="space-y-4">
            <div>
              <label class="block mb-1">Title</label>
              <input v-model="editingBook.title" type="text" class="w-full border rounded px-3 py-2" />
              <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
            </div>
            <div>
              <label class="block mb-1">Author</label>
              <input v-model="editingBook.author" type="text" class="w-full border rounded px-3 py-2" />
              <p v-if="errors.author" class="text-red-500 text-sm mt-1">{{ errors.author }}</p>
            </div>
            <div>
              <label class="block mb-1">Published Year</label>
              <input v-model="editingBook.published_year" type="number" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block mb-1">Genre</label>
              <input v-model="editingBook.genre" type="text" class="w-full border rounded px-3 py-2" />
            </div>
            <div class="flex justify-end gap-2">
              <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">บันทึก</button>
              <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded" @click="cancelEdit">ยกเลิก</button>
            </div>
          </form>
        </template>

        <template v-if="creatingBook">
          <h2 class="text-xl font-semibold mb-4">เพิ่มหนังสือใหม่</h2>
          <form @submit.prevent="submitCreate" class="space-y-4">
            <div>
              <label class="block mb-1">Title</label>
              <input v-model="newBook.title" type="text" class="w-full border rounded px-3 py-2" />
              <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
            </div>
            <div>
              <label class="block mb-1">Author</label>
              <input v-model="newBook.author" type="text" class="w-full border rounded px-3 py-2" />
              <p v-if="errors.author" class="text-red-500 text-sm mt-1">{{ errors.author }}</p>
            </div>
            <div>
              <label class="block mb-1">Published Year</label>
              <input v-model="newBook.published_year" type="number" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block mb-1">Genre</label>
              <input v-model="newBook.genre" type="text" class="w-full border rounded px-3 py-2" />
            </div>
            <div class="flex justify-end gap-2">
              <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">บันทึก</button>
              <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded"
                @click="closeCreateModal">ยกเลิก</button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import { ref, onMounted } from 'vue'

const books = ref<any[]>([])
const isLoading = ref(true)
const editingBook = ref<any>(null)
const detailBook = ref<any>(null)
const creatingBook = ref(false)
const newBook = ref({
  title: '',
  author: '',
  published_year: null as number | null,
  genre: '',
})

const errors = ref<{ [key: string]: string }>({})

const page = ref(1)
const limit = 10
const totalPages = ref(1)

const config = useRuntimeConfig()
const router = useRouter()

const showConfirmModal = ref(false)
const pendingDeleteId = ref(null)
const alertMessage = ref('')

onMounted(async () => {
  await loadBooks()
})

async function loadBooks() {
  isLoading.value = true
  const token = useCookie('token').value
  try {
    const data: any = await $fetch(`${config.public.API_URL}/book`, {
      headers: { Authorization: `Bearer ${token}` },
      query: { page: page.value, limit },
    })

    books.value = data.result || []

    const totalItems = Number(data.total) || 0
    const limitNum = Number(data.limit) || limit
    totalPages.value = Math.ceil(totalItems / limitNum)

    page.value = Number(data.page) || page.value
  } catch (err) {
    console.error('Error loading books:', err)
    return navigateTo('/login')
  } finally {
    isLoading.value = false
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  loadBooks()
}

function openDetailModal(book: any) {
  detailBook.value = book
}

function closeDetailModal() {
  detailBook.value = null
}

function startEdit(book: any) {
  editingBook.value = { ...book }
  errors.value = {}
}

function cancelEdit() {
  editingBook.value = null
  errors.value = {}
}

function openCreateModal() {
  creatingBook.value = true
  newBook.value = {
    title: '',
    author: '',
    published_year: null,
    genre: '',
  }
  errors.value = {}
}

function closeCreateModal() {
  creatingBook.value = false
  errors.value = {}
}

function validateBook(book: any) {
  errors.value = {}
  if (!book.title || !book.title.trim()) {
    errors.value.title = 'กรุณากรอก Title'
  }
  if (!book.author || !book.author.trim()) {
    errors.value.author = 'กรุณากรอก Author'
  }
  return Object.keys(errors.value).length === 0
}

async function submitCreate() {
  if (!validateBook(newBook.value)) return

  const token = useCookie('token').value

  try {
    const created: any = await $fetch(`${config.public.API_URL}/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: newBook.value,
    })
    books.value.push(created.result)
    creatingBook.value = false;
    showAlert('เพิ่มหนังสือสำเร็จ')
  } catch (err) {
    showAlert('สร้างหนังสือไม่สำเร็จ')
    console.error(err)
  }
}

async function submitEdit() {
  if (!validateBook(editingBook.value)) return

  const token = useCookie('token').value
  try {
    await $fetch(`${config.public.API_URL}/book/${editingBook.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: editingBook.value.title,
        author: editingBook.value.author,
        published_year: editingBook.value.published_year,
        genre: editingBook.value.genre,
      },
    })
    const index = books.value.findIndex(b => b.id === editingBook.value.id)
    if (index !== -1) {
      books.value[index] = { ...editingBook.value }
    }
    editingBook.value = null;
    showAlert('แก้ไขหนังสือสำเร็จ')

  } catch (err) {
    showAlert('แก้ไขข้อมูลไม่สำเร็จ')
    console.error(err)
  }
}

async function deleteBook(id: number) {
  const token = useCookie('token').value
  try {
    await $fetch(`${config.public.API_URL}/book/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    books.value = books.value.filter(book => book.id !== id)
    showAlert('ลบหนังสือสำเร็จ')
  } catch (err) {
    showAlert('ลบหนังสือไม่สำเร็จ')
    console.error(err)
  }
}

function showAlert(message: string) {
  alertMessage.value = message
  setTimeout(() => {
    alertMessage.value = ''
  }, 3000)
}

function openConfirmModal(id: any) {
  pendingDeleteId.value = id
  showConfirmModal.value = true
}

function cancelDelete() {
  showConfirmModal.value = false
  pendingDeleteId.value = null
}

async function confirmDelete() {
  if (!pendingDeleteId.value) return
  try {
    await deleteBook(pendingDeleteId.value)
  } finally {
    cancelDelete()
  }
}

function handleLogout() {
  useCookie('token').value = ''
  router.push('/login')
}
</script>
