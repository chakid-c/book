# 📚 Book Management System

ระบบจัดการหนังสือสำหรับคลังหนังสือ

---

## 🚀 Tech Stack

### Frontend
- [Nuxt 3](https://nuxt.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/) + MySQL
- [Passport + JWT](https://docs.nestjs.com/security/authentication)

---

## 📦 Features

- 🔐 Login ด้วย JWT Authentication
- 📚 CRUD หนังสือ (เพิ่ม / ดู / แก้ไข / ลบ)
- 🧑‍💼 Protected Routes สำหรับผู้ใช้ที่ล็อกอินแล้วเท่านั้น
- 📱 Responsive Design รองรับมือถือ
- 🔄 Loading & Error State ครบ
- 📄 Document API ด้วย Swagger (NestJS)
- 🧠 Logging และ Error Handling ฝั่ง Backend

---

## 🧰 Project Structure

### frontend

```bash
cd apps/front
npm install
cp .env.example .env

npm run dev
```

### Backend

```bash
cd apps/backend
npm install
cp .env.example .env
# แก้ค่า DB ใน .env ให้ตรงกับ local

npm run start:dev
```
