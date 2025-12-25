# How to Create an Organization

## Step-by-Step Guide

### 1. **Log In to DevFlow**
   - Go to `http://localhost:5173`
   - Sign in with your credentials:
     - Email: `arnoldswamy09@gmail.com`
     - Password: `password123`

### 2. **Navigate to Organizations**
   After logging in, you'll see the dashboard with a sidebar on the left:
   - Click the **"Organizations"** option in the sidebar (🏢 icon)
   - Or navigate directly to `http://localhost:5173/organizations`

### 3. **Click "Create Organization"**
   - In the top-right corner of the Organizations page, click the **"+ Create Organization"** button
   - This will open a form to create a new organization

### 4. **Fill in Organization Details**
   - **Organization Name** (Required): Enter a unique name for your organization
     - Example: "Acme Corporation", "Tech Startup Inc", "My Company"
   
   - **Description** (Optional): Add a brief description of your organization
     - Example: "Leading technology innovation company focused on SaaS solutions"

### 5. **Submit the Form**
   - Click the **"Create Organization"** button
   - Wait for the confirmation message (should say "Organization created successfully")

### 6. **View Your Organization**
   - Your newly created organization will appear in the list below
   - You'll see a card showing:
     - Organization name
     - Description
     - Creation date
     - Action buttons (View, Edit)

---

## What Happens After Creation?

Once you create an organization, you can:
- ✅ **Add Teams** - Create teams within the organization
- ✅ **Create Projects** - Assign projects to the organization
- ✅ **Manage Members** - Add users to the organization
- ✅ **View Details** - Click "View" to see organization details
- ✅ **Edit Info** - Update organization name and description

---

## Tips & Best Practices

1. **Use Clear Names**: Give your organization a name that clearly describes your company/group
2. **Add Description**: Always include a description for future reference and team clarity
3. **Organization per Company**: Typically create one organization per company or major business unit
4. **Permissions**: Make sure you have the correct admin role to create organizations (Admin or Manager roles)

---

## Troubleshooting

### "Request failed with status code 401"
- You may not be logged in
- Try logging in again with valid credentials

### "Internal server error"
- The backend server might not be running
- Make sure `npm run dev` is running in the backend folder

### Form doesn't submit
- Make sure "Organization Name" field is filled (it's required)
- Check browser console for any error messages

---

## Next Steps After Creating Organization

1. Go to the organization (click "View")
2. Create a **Team** within the organization
3. Create a **Project** in the team
4. Create a **Sprint** for the project
5. Start adding **Tasks** to the sprint

Enjoy managing your organization in DevFlow! 🚀
