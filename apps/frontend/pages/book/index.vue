<template>
  <div class="container">
    <header class="header">
      <button class="btn btn-create" @click="openCreateModal">เพิ่มหนังสือ</button>
      <h1>Books</h1>
      <button class="btn btn-logout" @click="handleLogout">Logout</button>
    </header>

    <div v-if="isLoading" class="spinner-container">
      <div class="spinner"></div>
    </div>

    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published Year</th>
            <th>Genre</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.published_year || '-' }}</td>
            <td>{{ book.genre || '-' }}</td>
            <td>
              <button @click="openDetailModal(book)" class="btn btn-view">ดูรายละเอียด</button>
              <button @click="startEdit(book)" class="btn btn-edit">แก้ไข</button>
              <button @click="deleteBook(book.id)" class="btn btn-delete">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button :disabled="page === 1" @click="changePage(page - 1)">ก่อนหน้า</button>
        <span>หน้า {{ page }} / {{ totalPages }}</span>
        <button :disabled="page === totalPages" @click="changePage(page + 1)">ถัดไป</button>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailBook" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal modal-detail">
        <h2>รายละเอียดหนังสือ</h2>
        <p><strong>Title:</strong> {{ detailBook.title }}</p>
        <p><strong>Author:</strong> {{ detailBook.author }}</p>
        <p><strong>Published Year:</strong> {{ detailBook.published_year || '-' }}</p>
        <p><strong>Genre:</strong> {{ detailBook.genre || '-' }}</p>
        <button @click="closeDetailModal" class="btn btn-close">ปิด</button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingBook" class="modal-backdrop" @click.self="cancelEdit">
      <div class="modal">
        <h2>แก้ไขหนังสือ</h2>
        <form @submit.prevent="submitEdit">
          <label>
            Title:
            <input v-model="editingBook.title" type="text" />
            <p v-if="errors.title" class="error-message">{{ errors.title }}</p>
          </label>
          <label>
            Author:
            <input v-model="editingBook.author" type="text" />
            <p v-if="errors.author" class="error-message">{{ errors.author }}</p>
          </label>
          <label>
            Published Year:
            <input v-model="editingBook.published_year" type="number" min="0" />
          </label>
          <label>
            Genre:
            <input v-model="editingBook.genre" type="text" />
          </label>

          <div class="modal-actions">
            <button type="submit" class="btn btn-save">บันทึก</button>
            <button type="button" class="btn btn-cancel" @click="cancelEdit">ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="creatingBook" class="modal-backdrop" @click.self="cancelCreate">
      <div class="modal">
        <h2>เพิ่มหนังสือใหม่</h2>
        <form @submit.prevent="submitCreate">
          <label>
            Title:
            <input v-model="newBook.title" type="text" />
            <p v-if="errors.title" class="error-message">{{ errors.title }}</p>
          </label>
          <label>
            Author:
            <input v-model="newBook.author" type="text" />
            <p v-if="errors.author" class="error-message">{{ errors.author }}</p>
          </label>
          <label>
            Published Year:
            <input v-model="newBook.published_year" type="number" min="0" />
          </label>
          <label>
            Genre:
            <input v-model="newBook.genre" type="text" />
          </label>
          <div class="modal-actions">
            <button type="submit" class="btn btn-save">บันทึก</button>
            <button type="button" class="btn btn-cancel" @click="closeCreateModal">ยกเลิก</button>
          </div>
        </form>
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

onMounted(async () => {
  await loadBooks()
})

async function loadBooks() {
  isLoading.value = true
  const token = useCookie('token').value
  try {
    const data = await $fetch(`${config.public.API_URL}/book`, {
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
    const created = await $fetch(`${config.public.API_URL}/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: newBook.value,
    })
    books.value.push(created.result)
    creatingBook.value = false
  } catch (err) {
    alert('สร้างหนังสือไม่สำเร็จ')
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
    editingBook.value = null
  } catch (err) {
    alert('แก้ไขข้อมูลไม่สำเร็จ')
    console.error(err)
  }
}

async function deleteBook(id: number) {
  const confirmed = confirm('แน่ใจนะว่าจะลบหนังสือเล่มนี้?')
  if (!confirmed) return

  const token = useCookie('token').value
  try {
    await $fetch(`${config.public.API_URL}/book/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    books.value = books.value.filter(book => book.id !== id)
  } catch (err) {
    alert('ลบไม่สำเร็จ')
    console.error(err)
  }
}

function handleLogout() {
  useCookie('token').value = ''
  router.push('/login')
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
  font-family: Arial, sans-serif;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

h1 {
  font-size: 28px;
  margin: 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 12px 16px;
  text-align: left;
}

.table th {
  background-color: #f3f3f3;
}

.table tbody tr:hover {
  background-color: #fafafa;
}

.btn {
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  text-decoration: none;
  color: white;
  display: inline-block;
  user-select: none;
}

.btn-view {
  background-color: #3b82f6;
  margin-right: 8px;
}

.btn-view:hover {
  background-color: #2563eb;
}

.btn-edit {
  background-color: #f59e0b;
  margin-right: 8px;
}

.btn-edit:hover {
  background-color: #d97706;
}

.btn-delete {
  background-color: #ef4444;
}

.btn-delete:hover {
  background-color: #b91c1c;
}

.btn-logout {
  background-color: #ef4444;
  padding: 8px 16px;
  font-weight: bold;
}

.btn-logout:hover {
  background-color: #b91c1c;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

.spinner {
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 20px 24px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 0 20px rgba(0,0,0,0.25);
  font-size: 14px;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 12px;
}

.modal form label {
  display: block;
  margin-bottom: 10px;
}

.modal form input {
  width: 100%;
  padding: 6px 8px;
  font-size: 14px;
  margin-top: 4px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.btn-save {
  background-color: #10b981;
}

.btn-save:hover {
  background-color: #059669;
}

.btn-cancel {
  background-color: #6b7280;
}

.btn-cancel:hover {
  background-color: #4b5563;
}

.modal-detail p {
  margin: 8px 0;
  line-height: 1.4;
}

.btn-close {
  margin-top: 12px;
  background-color: #6b7280;
  padding: 6px 12px;
}

.btn-close:hover {
  background-color: #4b5563;
}

.btn-create {
  background-color: #3b82f6;
  margin-right: 12px;
  padding: 8px 16px;
  font-weight: 600;
  color: white;
  border-radius: 6px;
}

.btn-create:hover {
  background-color: #2563eb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
}

.pagination button {
  padding: 6px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  user-select: none;
}
</style>
