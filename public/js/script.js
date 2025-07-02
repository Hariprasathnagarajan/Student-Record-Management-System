class StudentManager {
  constructor() {
    this.studentForm = document.getElementById('studentForm');
    this.studentsTableBody = document.getElementById('studentsTableBody');
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.studentCount = document.getElementById('studentCount');
    this.formTitle = document.getElementById('form-title');
    
    this.isEditing = false;
    this.currentStudentId = null;
    this.allStudents = [];
    
    this.init();
  }
  
  init() {
    this.loadStudents();
    this.setupEventListeners();
    this.setCurrentYear();
  }
  
  setCurrentYear() {
    document.getElementById('enrollmentYear').max = new Date().getFullYear();
  }
  
  setupEventListeners() {
    this.studentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.cancelBtn.addEventListener('click', () => this.resetForm());
    this.searchBtn.addEventListener('click', () => this.searchStudents());
    this.searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.searchStudents();
    });
  }
  
  async loadStudents() {
    try {
      const response = await fetch('http://localhost:5000/api/students');
      const { data } = await response.json();
      
      this.allStudents = data;
      this.displayStudents(data);
      this.updateStudentCount(data.length);
    } catch (error) {
      console.error('Error loading students:', error);
      this.showError('Failed to load students. Please try again.');
    }
  }
  
  displayStudents(students) {
    this.studentsTableBody.innerHTML = '';
    
    if (students.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="7" class="text-center">No students found</td>
      `;
      this.studentsTableBody.appendChild(row);
      return;
    }
    
    students.forEach(student => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.age}</td>
        <td>${student.grade}</td>
        <td>${student.enrollmentYear}</td>
        <td>${this.formatDate(student.enrollmentDate)}</td>
        <td class="action-buttons">
          <button class="btn btn-edit" data-id="${student._id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-delete" data-id="${student._id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      
      this.studentsTableBody.appendChild(row);
      
      // Add event listeners to the new buttons
      row.querySelector('.btn-edit').addEventListener('click', () => this.editStudent(student._id));
      row.querySelector('.btn-delete').addEventListener('click', () => this.deleteStudent(student._id));
    });
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  updateStudentCount(count) {
    this.studentCount.textContent = count;
  }
  
  searchStudents() {
    const searchTerm = this.searchInput.value.toLowerCase();
    
    if (!searchTerm) {
      this.displayStudents(this.allStudents);
      this.updateStudentCount(this.allStudents.length);
      return;
    }
    
    const filteredStudents = this.allStudents.filter(student => 
      student.name.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm) ||
      student.grade.toLowerCase().includes(searchTerm) ||
      student.enrollmentYear.toString().includes(searchTerm)
    );
    
    this.displayStudents(filteredStudents);
    this.updateStudentCount(filteredStudents.length);
  }
  
  validateForm() {
    let isValid = true;
    const currentYear = new Date().getFullYear();
    const enrollmentYear = parseInt(document.getElementById('enrollmentYear').value);
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => {
      el.style.display = 'none';
    });
    
    // Validate name
    if (!document.getElementById('name').value.trim()) {
      document.getElementById('name-error').textContent = 'Name is required';
      document.getElementById('name-error').style.display = 'block';
      isValid = false;
    }
    
    // Validate email
    const email = document.getElementById('email').value;
    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required';
      document.getElementById('email-error').style.display = 'block';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('email-error').textContent = 'Please enter a valid email';
      document.getElementById('email-error').style.display = 'block';
      isValid = false;
    }
    
    // Validate age
    const age = parseInt(document.getElementById('age').value);
    if (!age) {
      document.getElementById('age-error').textContent = 'Age is required';
      document.getElementById('age-error').style.display = 'block';
      isValid = false;
    } else if (age < 5 || age > 120) {
      document.getElementById('age-error').textContent = 'Age must be between 5 and 120';
      document.getElementById('age-error').style.display = 'block';
      isValid = false;
    }
    
    // Validate grade
    if (!document.getElementById('grade').value) {
      document.getElementById('grade-error').textContent = 'Grade is required';
      document.getElementById('grade-error').style.display = 'block';
      isValid = false;
    }
    
    // Validate enrollment year
    if (!enrollmentYear) {
      document.getElementById('enrollmentYear-error').textContent = 'Enrollment year is required';
      document.getElementById('enrollmentYear-error').style.display = 'block';
      isValid = false;
    } else if (enrollmentYear < 2000 || enrollmentYear > currentYear) {
      document.getElementById('enrollmentYear-error').textContent = `Year must be between 2000 and ${currentYear}`;
      document.getElementById('enrollmentYear-error').style.display = 'block';
      isValid = false;
    }
    
    return isValid;
  }
  
  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    const student = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      age: parseInt(document.getElementById('age').value),
      grade: document.getElementById('grade').value,
      enrollmentYear: parseInt(document.getElementById('enrollmentYear').value)
    };
    
    try {
      if (this.isEditing) {
        await this.updateStudent(this.currentStudentId, student);
      } else {
        await this.addStudent(student);
      }
    } catch (error) {
      console.error('Error saving student:', error);
      this.showError('Failed to save student. Please try again.');
    }
  }
  
  async addStudent(student) {
    const response = await fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    
    const { data, error } = await response.json();
    
    if (error) {
      this.showError(error);
      return;
    }
    
    this.allStudents.unshift(data);
    this.displayStudents(this.allStudents);
    this.updateStudentCount(this.allStudents.length);
    this.resetForm();
    this.showSuccess('Student added successfully!');
  }
  
  async editStudent(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${id}`);
      const { data } = await response.json();
      
      document.getElementById('studentId').value = data._id;
      document.getElementById('name').value = data.name;
      document.getElementById('email').value = data.email;
      document.getElementById('age').value = data.age;
      document.getElementById('grade').value = data.grade;
      document.getElementById('enrollmentYear').value = data.enrollmentYear;
      
      this.isEditing = true;
      this.currentStudentId = data._id;
      this.formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit Student';
      this.saveBtn.innerHTML = '<i class="fas fa-save"></i> Update';
      
      // Scroll to form
      document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error editing student:', error);
      this.showError('Failed to load student data. Please try again.');
    }
  }
  
  async updateStudent(id, student) {
    const response = await fetch(`http://localhost:5000/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    
    const { data, error } = await response.json();
    
    if (error) {
      this.showError(error);
      return;
    }
    
    // Update the student in the local array
    const index = this.allStudents.findIndex(s => s._id === id);
    if (index !== -1) {
      this.allStudents[index] = data;
    }
    
    this.displayStudents(this.allStudents);
    this.resetForm();
    this.showSuccess('Student updated successfully!');
  }
  
  async deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE',
      });
      
      const { error } = await response.json();
      
      if (error) {
        this.showError(error);
        return;
      }
      
      // Remove the student from the local array
      this.allStudents = this.allStudents.filter(student => student._id !== id);
      
      this.displayStudents(this.allStudents);
      this.updateStudentCount(this.allStudents.length);
      this.showSuccess('Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      this.showError('Failed to delete student. Please try again.');
    }
  }
  
  resetForm() {
    this.studentForm.reset();
    document.getElementById('studentId').value = '';
    this.isEditing = false;
    this.currentStudentId = null;
    this.formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Student Form';
    this.saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => {
      el.style.display = 'none';
    });
  }
  
  showError(message) {
    alert(`Error: ${message}`);
  }
  
  showSuccess(message) {
    alert(`Success: ${message}`);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new StudentManager();
});