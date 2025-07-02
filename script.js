// Sistema de Gestão de Horários - Ciências Econômicas UESC
// Arquivo principal JavaScript


// Firebase imports
import { db } from './firebase.js';
import {
  collection, getDocs, addDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// Estrutura de dados global
let appData = {
    professores: [],
    disciplinas: [],
    turmas: [],
    salas: [],
    horarios: []
};

// Configurações dos horários
const HORARIOS_CONFIG = {
    matutino: {
        dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
        blocos: [
            { id: 1, inicio: '07:30', fim: '08:20' },
            { id: 2, inicio: '08:20', fim: '09:10' },
            { id: 3, inicio: '09:10', fim: '10:00' },
            { id: 4, inicio: '10:00', fim: '10:50' },
            { id: 5, inicio: '10:50', fim: '11:40' },
            { id: 6, inicio: '11:40', fim: '12:30' }
        ],
        semestres: Array.from({length: 9}, (_, i) => i + 1)
    },
    noturno: {
        dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'],
        blocos: {
            'segunda': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'terca': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'quarta': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'quinta': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'sexta': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'sabado': [
                { id: 1, inicio: '07:30', fim: '08:20' },
                { id: 2, inicio: '08:20', fim: '09:10' },
                { id: 3, inicio: '09:10', fim: '10:00' },
                { id: 4, inicio: '10:00', fim: '10:50' },
                { id: 5, inicio: '10:50', fim: '11:40' },
                { id: 6, inicio: '11:40', fim: '12:30' }
            ]
        },
        semestres: Array.from({length: 10}, (_, i) => i + 1)
    }
};

const CODIGOS_TURMA = {
    matutino: {
        regular: ['T02'],
        extra: ['T04', 'T06']
    },
    noturno: {
        regular: ['T01'],
        extra: ['T03', 'T05']
    }
};

// Utilitários
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts-container');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' :
                 type === 'error' ? 'fas fa-exclamation-circle' :
                 type === 'warning' ? 'fas fa-exclamation-triangle' :
                 'fas fa-info-circle';
    
    alert.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="alert-close">&times;</button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
    
    // Close button
    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.parentNode.removeChild(alert);
    });
}

function clearForm(formId) {
    const form = document.getElementById(formId);
    form.reset();
    
    // Clear multiple selects
    const multiSelects = form.querySelectorAll('select[multiple]');
    multiSelects.forEach(select => {
        Array.from(select.options).forEach(option => option.selected = false);
    });
    
    // Clear checkboxes
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

// Navegação
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update active nav button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Update dashboard counts when returning to dashboard
            if (targetSection === 'dashboard') {
                updateDashboardCounts();
            }
        });
    });
}

// Tabs nos cadastros
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Dashboard
function updateDashboardCounts() {
    document.getElementById('professores-count').textContent = appData.professores.length;
    document.getElementById('disciplinas-count').textContent = appData.disciplinas.length;
    document.getElementById('turmas-count').textContent = appData.turmas.length;
    document.getElementById('salas-count').textContent = appData.salas.length;
}

// Professores
function initProfessores() {
  const form = document.getElementById('professor-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('professor-nome').value.trim();
      const email = document.getElementById('professor-email').value.trim();
      if (!nome) {
        alert('Nome obrigatório!');
        return;
      }
      await addDoc(collection(db, 'professores'), { nome, email });
      alert('Professor adicionado.');
      form.reset();
      loadProfessores();
    });
  }
}

async function loadProfessores() {
  const querySnapshot = await getDocs(collection(db, "professores"));
  appData.professores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProfessores();
}

function renderProfessores() {
  const container = document.getElementById('professores-list');
  if (!container) return;
  if (appData.professores.length === 0) {
    container.innerHTML = '<p>Nenhum professor cadastrado.</p>';
    return;
  }
  container.innerHTML = appData.professores.map(p => `
    <div class="item-card">
      <div><strong>${p.nome}</strong> (${p.email || 'Sem email'})</div>
      <button onclick="deleteProfessor('${p.id}')">Excluir</button>
    </div>
  `).join('');
}

window.deleteProfessor = async function(id) {
  if (confirm('Excluir professor?')) {
    await deleteDoc(doc(db, "professores", id));
    loadProfessores();
  }
};


function initDisciplinas() {
  const form = document.getElementById('disciplina-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('disciplina-nome').value.trim();
      const codigo = document.getElementById('disciplina-codigo').value.trim();
      const turno = document.getElementById('disciplina-turno').value;
      const semestre = parseInt(document.getElementById('disciplina-semestre').value);
      if (!nome || !codigo) {
        alert('Preencha todos os campos!');
        return;
      }
      await addDoc(collection(db, 'disciplinas'), { nome, codigo, turno, semestre });
      alert('Disciplina adicionada.');
      form.reset();
      loadDisciplinas();
    });
  }
}

async function loadDisciplinas() {
  const querySnapshot = await getDocs(collection(db, "disciplinas"));
  appData.disciplinas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderDisciplinas();
}

function renderDisciplinas() {
  const container = document.getElementById('disciplinas-list');
  if (!container) return;
  if (appData.disciplinas.length === 0) {
    container.innerHTML = '<p>Nenhuma disciplina cadastrada.</p>';
    return;
  }
  container.innerHTML = appData.disciplinas.map(d => `
    <div class="item-card">
      <div><strong>${d.nome}</strong> (${d.codigo}) - ${d.turno} - ${d.semestre}º semestre</div>
      <button onclick="deleteDisciplina('${d.id}')">Excluir</button>
    </div>
  `).join('');
}

window.deleteDisciplina = async function(id) {
  if (confirm('Excluir disciplina?')) {
    await deleteDoc(doc(db, "disciplinas", id));
    loadDisciplinas();
  }
};

function initTurmas() {
  const form = document.getElementById('turma-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('turma-nome').value.trim();
      const turno = document.getElementById('turma-turno').value;
      const semestre = parseInt(document.getElementById('turma-semestre').value);
      if (!nome) {
        alert('Preencha todos os campos!');
        return;
      }
      await addDoc(collection(db, 'turmas'), { nome, turno, semestre });
      alert('Turma adicionada.');
      form.reset();
      loadTurmas();
    });
  }
}

async function loadTurmas() {
  const querySnapshot = await getDocs(collection(db, "turmas"));
  appData.turmas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTurmas();
}

function renderTurmas() {
  const container = document.getElementById('turmas-list');
  if (!container) return;
  if (appData.turmas.length === 0) {
    container.innerHTML = '<p>Nenhuma turma cadastrada.</p>';
    return;
  }
  container.innerHTML = appData.turmas.map(t => `
    <div class="item-card">
      <div><strong>${t.nome}</strong> - ${t.turno} - ${t.semestre}º semestre</div>
      <button onclick="deleteTurma('${t.id}')">Excluir</button>
    </div>
  `).join('');
}

window.deleteTurma = async function(id) {
  if (confirm('Excluir turma?')) {
    await deleteDoc(doc(db, "turmas", id));
    loadTurmas();
  }
};

// Salas
function initSalas() {
  const form = document.getElementById('sala-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('sala-nome').value.trim();
      if (!nome) {
        alert('Preencha o nome da sala!');
        return;
      }
      await addDoc(collection(db, 'salas'), { nome });
      alert('Sala adicionada.');
      form.reset();
      loadSalas();
    });
  }
}

async function loadSalas() {
  const querySnapshot = await getDocs(collection(db, "salas"));
  appData.salas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderSalas();
}

function renderSalas() {
  const container = document.getElementById('salas-list');
  if (!container) return;
  if (appData.salas.length === 0) {
    container.innerHTML = '<p>Nenhuma sala cadastrada.</p>';
    return;
  }
  container.innerHTML = appData.salas.map(s => `
    <div class="item-card">
      <div><strong>${s.nome}</strong></div>
      <button onclick="deleteSala('${s.id}')">Excluir</button>
    </div>
  `).join('');
}

window.deleteSala = async function(id) {
  if (confirm('Excluir sala?')) {
    await deleteDoc(doc(db, "salas", id));
    loadSalas();
  }
};

// Update select options across the app
function updateSelectOptions() {
    // Update professor disciplinas select
    const professorDisciplinasSelect = document.getElementById('professor-disciplinas');
    professorDisciplinasSelect.innerHTML = '';
    appData.disciplinas.forEach(disciplina => {
        const option = document.createElement('option');
        option.value = disciplina.id;
        option.textContent = `${disciplina.nome} (${disciplina.codigo})`;
        professorDisciplinasSelect.appendChild(option);
    });
    
    // Update horario selects
    updateHorarioSelects();
    
    // Update print selects
    updatePrintSelects();
}

function updateHorarioSelects() {
    const turmaSelect = document.getElementById('horario-turma');
    turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
    appData.turmas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma.id;
        option.textContent = turma.nome;
        turmaSelect.appendChild(option);
    });
}

function updatePrintSelects() {
    // Update print turma select
    const printTurmaSelect = document.getElementById('print-turma');
    printTurmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
    appData.turmas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma.id;
        option.textContent = turma.nome;
        printTurmaSelect.appendChild(option);
    });
    
    // Update print professor select
    const printProfessorSelect = document.getElementById('print-professor');
    printProfessorSelect.innerHTML = '<option value="">Selecione um professor</option>';
    appData.professores.forEach(professor => {
        const option = document.createElement('option');
        option.value = professor.id;
        option.textContent = professor.nome;
        printProfessorSelect.appendChild(option);
    });
}

// Data persistence

function loadData() {
  loadProfessores();
  loadDisciplinas();
  loadTurmas();
  loadSalas();
}


// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTabs();
    initProfessores();
    initDisciplinas();
    initTurmas();
    initSalas();
    initHorarios();
    initImpressao();
    
    // Load saved data
    loadData();
    
    console.log('Sistema de Gestão de Horários inicializado com sucesso!');
});


// Horários - Funcionalidades avançadas
function initHorarios() {
    const turmaSelect = document.getElementById('horario-turma');
    const novoHorarioBtn = document.getElementById('btn-novo-horario');
    const limparHorariosBtn = document.getElementById('btn-limpar-horarios');
    const modal = document.getElementById('horario-modal');
    const modalForm = document.getElementById('horario-form');
    
    let currentSlot = null; // Slot atual sendo editado
    
    // Event listeners
    turmaSelect.addEventListener('change', () => {
        if (turmaSelect.value) {
            renderHorariosGrid(turmaSelect.value);
        } else {
            document.getElementById('horarios-grid').innerHTML = '<p class="no-activity">Selecione uma turma para visualizar os horários</p>';
        }
    });
    
    novoHorarioBtn.addEventListener('click', () => {
        if (!turmaSelect.value) {
            showAlert('Selecione uma turma primeiro', 'warning');
            return;
        }
        openHorarioModal();
    });
    
    limparHorariosBtn.addEventListener('click', () => {
        if (!turmaSelect.value) {
            showAlert('Selecione uma turma primeiro', 'warning');
            return;
        }
        
        if (confirm('Tem certeza que deseja limpar todos os horários desta turma?')) {
            appData.horarios = appData.horarios.filter(h => h.idTurma !== turmaSelect.value);
            renderHorariosGrid(turmaSelect.value);
            showAlert('Horários limpos com sucesso!', 'success');
            saveData();
        }
    });
    
    // Modal events
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            closeHorarioModal();
        }
    });
    
    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveHorario();
    });
}

function renderHorariosGrid(turmaId) {
    const turma = appData.turmas.find(t => t.id === turmaId);
    if (!turma) return;
    
    const container = document.getElementById('horarios-grid');
    const config = HORARIOS_CONFIG[turma.turno];
    
    let html = '<table class="grade-horarios">';
    
    // Header
    html += '<thead><tr><th>Horário</th>';
    
    if (turma.turno === 'matutino') {
        config.dias.forEach(dia => {
            html += `<th>${formatDiaName(dia)}</th>`;
        });
    } else {
        // Noturno - diferentes horários para cada dia
        config.dias.forEach(dia => {
            html += `<th>${formatDiaName(dia)}</th>`;
        });
    }
    
    html += '</tr></thead><tbody>';
    
    // Body
    if (turma.turno === 'matutino') {
        config.blocos.forEach(bloco => {
            html += `<tr><td class="horario-label">${bloco.inicio} - ${bloco.fim}</td>`;
            
            config.dias.forEach(dia => {
                const horario = getHorarioSlot(turmaId, dia, bloco.id);
                html += `<td class="horario-slot ${horario ? 'ocupado' : ''}" 
                            data-dia="${dia}" 
                            data-bloco="${bloco.id}" 
                            onclick="editHorarioSlot('${turmaId}', '${dia}', ${bloco.id})">`;
                
                if (horario) {
                    const disciplina = appData.disciplinas.find(d => d.id === horario.idDisciplina);
                    const professor = appData.professores.find(p => p.id === horario.idProfessor);
                    const sala = appData.salas.find(s => s.id === horario.idSala);
                    
                    html += `<div class="horario-info">
                                <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                                <div class="professor">${professor?.nome || 'N/A'}</div>
                                <div class="sala">${sala?.nome || 'N/A'}</div>
                             </div>`;
                } else {
                    html += '<div class="horario-vazio">+</div>';
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        });
    } else {
        // Noturno - lógica mais complexa
        const maxBlocos = Math.max(...config.dias.map(dia => config.blocos[dia].length));
        
        for (let i = 0; i < maxBlocos; i++) {
            html += '<tr>';
            
            // Primeira coluna com horários variados
            const horarios = config.dias.map(dia => {
                const bloco = config.blocos[dia][i];
                return bloco ? `${bloco.inicio} - ${bloco.fim}` : '';
            }).filter(h => h);
            
            const horarioUnico = [...new Set(horarios)];
            html += `<td class="horario-label">${horarioUnico.join(' / ')}</td>`;
            
            config.dias.forEach(dia => {
                const bloco = config.blocos[dia][i];
                if (bloco) {
                    const horario = getHorarioSlot(turmaId, dia, bloco.id);
                    html += `<td class="horario-slot ${horario ? 'ocupado' : ''}" 
                                data-dia="${dia}" 
                                data-bloco="${bloco.id}" 
                                onclick="editHorarioSlot('${turmaId}', '${dia}', ${bloco.id})">`;
                    
                    if (horario) {
                        const disciplina = appData.disciplinas.find(d => d.id === horario.idDisciplina);
                        const professor = appData.professores.find(p => p.id === horario.idProfessor);
                        const sala = appData.salas.find(s => s.id === horario.idSala);
                        
                        html += `<div class="horario-info">
                                    <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                                    <div class="professor">${professor?.nome || 'N/A'}</div>
                                    <div class="sala">${sala?.nome || 'N/A'}</div>
                                 </div>`;
                    } else {
                        html += '<div class="horario-vazio">+</div>';
                    }
                    
                    html += '</td>';
                } else {
                    html += '<td class="horario-slot disabled"></td>';
                }
            });
            
            html += '</tr>';
        }
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function formatDiaName(dia) {
    const nomes = {
        'segunda': 'Segunda',
        'terca': 'Terça',
        'quarta': 'Quarta',
        'quinta': 'Quinta',
        'sexta': 'Sexta',
        'sabado': 'Sábado'
    };
    return nomes[dia] || dia;
}

function getHorarioSlot(turmaId, dia, bloco) {
    return appData.horarios.find(h => 
        h.idTurma === turmaId && 
        h.diaSemana === dia && 
        h.bloco === bloco
    );
}

function editHorarioSlot(turmaId, dia, bloco) {
    const turma = appData.turmas.find(t => t.id === turmaId);
    if (!turma) return;
    
    currentSlot = { turmaId, dia, bloco };
    
    // Populate modal with current data if exists
    const existingHorario = getHorarioSlot(turmaId, dia, bloco);
    
    if (existingHorario) {
        document.getElementById('modal-disciplina').value = existingHorario.idDisciplina;
        document.getElementById('modal-professor').value = existingHorario.idProfessor;
        document.getElementById('modal-sala').value = existingHorario.idSala;
    } else {
        document.getElementById('horario-form').reset();
    }
    
    // Update modal selects
    updateModalSelects(turma);
    
    openHorarioModal();
}

function openHorarioModal() {
    const modal = document.getElementById('horario-modal');
    modal.classList.add('active');
}

function closeHorarioModal() {
    const modal = document.getElementById('horario-modal');
    modal.classList.remove('active');
    currentSlot = null;
}

function updateModalSelects(turma) {
    // Update disciplinas select - only for the turma's semester and turno
    const disciplinaSelect = document.getElementById('modal-disciplina');
    disciplinaSelect.innerHTML = '<option value="">Selecione a disciplina</option>';
    
    const disciplinasValidas = appData.disciplinas.filter(d => 
        d.turno === turma.turno && d.semestre === turma.semestreCurricular
    );
    
    disciplinasValidas.forEach(disciplina => {
        const option = document.createElement('option');
        option.value = disciplina.id;
        option.textContent = `${disciplina.nome} (${disciplina.codigo})`;
        disciplinaSelect.appendChild(option);
    });
    
    // Update professores select - only those who can teach the selected disciplina
    const professorSelect = document.getElementById('modal-professor');
    professorSelect.innerHTML = '<option value="">Selecione o professor</option>';
    
    disciplinaSelect.addEventListener('change', () => {
        const disciplinaId = disciplinaSelect.value;
        professorSelect.innerHTML = '<option value="">Selecione o professor</option>';
        
        if (disciplinaId) {
            const professoresValidos = appData.professores.filter(p => 
                p.disciplinas.includes(disciplinaId)
            );
            
            professoresValidos.forEach(professor => {
                const option = document.createElement('option');
                option.value = professor.id;
                option.textContent = professor.nome;
                professorSelect.appendChild(option);
            });
        }
    });
    
    // Update salas select
    const salaSelect = document.getElementById('modal-sala');
    salaSelect.innerHTML = '<option value="">Selecione a sala</option>';
    
    appData.salas.forEach(sala => {
        const option = document.createElement('option');
        option.value = sala.id;
        option.textContent = sala.nome;
        salaSelect.appendChild(option);
    });
}

function saveHorario() {
    if (!currentSlot) return;
    
    const disciplinaId = document.getElementById('modal-disciplina').value;
    const professorId = document.getElementById('modal-professor').value;
    const salaId = document.getElementById('modal-sala').value;
    
    if (!disciplinaId || !professorId || !salaId) {
        showAlert('Todos os campos são obrigatórios', 'error');
        return;
    }
    
    // Validações de conflito
    const conflitos = validateHorarioConflicts(currentSlot, professorId, salaId);
    
    if (conflitos.length > 0) {
        showAlert(`Conflitos detectados: ${conflitos.join(', ')}`, 'error');
        return;
    }
    
    // Remove existing horario if editing
    appData.horarios = appData.horarios.filter(h => 
        !(h.idTurma === currentSlot.turmaId && 
          h.diaSemana === currentSlot.dia && 
          h.bloco === currentSlot.bloco)
    );
    
    // Add new horario
    const novoHorario = {
        id: generateId(),
        diaSemana: currentSlot.dia,
        bloco: currentSlot.bloco,
        idTurma: currentSlot.turmaId,
        idDisciplina: disciplinaId,
        idProfessor: professorId,
        idSala: salaId
    };
    
    appData.horarios.push(novoHorario);
    
    // Update display
    renderHorariosGrid(currentSlot.turmaId);
    closeHorarioModal();
    showAlert('Horário salvo com sucesso!', 'success');
    saveData();
}

function validateHorarioConflicts(slot, professorId, salaId) {
    const conflitos = [];
    
    // Check professor conflict
    const professorConflict = appData.horarios.find(h => 
        h.idProfessor === professorId && 
        h.diaSemana === slot.dia && 
        h.bloco === slot.bloco &&
        !(h.idTurma === slot.turmaId && h.diaSemana === slot.dia && h.bloco === slot.bloco)
    );
    
    if (professorConflict) {
        const turmaConflito = appData.turmas.find(t => t.id === professorConflict.idTurma);
        conflitos.push(`Professor já alocado na turma ${turmaConflito?.nome || 'N/A'}`);
    }
    
    // Check sala conflict
    const salaConflict = appData.horarios.find(h => 
        h.idSala === salaId && 
        h.diaSemana === slot.dia && 
        h.bloco === slot.bloco &&
        !(h.idTurma === slot.turmaId && h.diaSemana === slot.dia && h.bloco === slot.bloco)
    );
    
    if (salaConflict) {
        const turmaConflito = appData.turmas.find(t => t.id === salaConflict.idTurma);
        conflitos.push(`Sala já ocupada pela turma ${turmaConflito?.nome || 'N/A'}`);
    }
    
    return conflitos;
}

// Delete horario (right-click or delete button)
function deleteHorario(turmaId, dia, bloco) {
    if (confirm('Tem certeza que deseja excluir este horário?')) {
        appData.horarios = appData.horarios.filter(h => 
            !(h.idTurma === turmaId && h.diaSemana === dia && h.bloco === bloco)
        );
        
        renderHorariosGrid(turmaId);
        showAlert('Horário excluído com sucesso!', 'success');
        saveData();
    }
}

// Add right-click context menu for deleting horarios
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.horario-slot.ocupado')) {
        e.preventDefault();
        
        const slot = e.target.closest('.horario-slot');
        const dia = slot.getAttribute('data-dia');
        const bloco = parseInt(slot.getAttribute('data-bloco'));
        const turmaId = document.getElementById('horario-turma').value;
        
        if (confirm('Deseja excluir este horário?')) {
            deleteHorario(turmaId, dia, bloco);
        }
    }
});


// Impressão - Funcionalidades
function initImpressao() {
    const printTurmaBtn = document.getElementById('btn-print-turma');
    const printProfessorBtn = document.getElementById('btn-print-professor');
    
    printTurmaBtn.addEventListener('click', () => {
        const turmaId = document.getElementById('print-turma').value;
        if (!turmaId) {
            showAlert('Selecione uma turma', 'warning');
            return;
        }
        generateTurmaPrint(turmaId);
    });
    
    printProfessorBtn.addEventListener('click', () => {
        const professorId = document.getElementById('print-professor').value;
        if (!professorId) {
            showAlert('Selecione um professor', 'warning');
            return;
        }
        generateProfessorPrint(professorId);
    });
}

function generateTurmaPrint(turmaId) {
    const turma = appData.turmas.find(t => t.id === turmaId);
    if (!turma) return;
    
    const preview = document.getElementById('print-preview');
    preview.classList.remove('hidden');
    
    const config = HORARIOS_CONFIG[turma.turno];
    const horariosData = appData.horarios.filter(h => h.idTurma === turmaId);
    
    let html = `
        <div class="print-header">
            <h2>Horário de Aulas - ${turma.nome}</h2>
            <p>Curso: Ciências Econômicas - UESC</p>
            <p>Gerado em: ${formatDateTime(new Date())}</p>
        </div>
        
        <table class="grade-horarios print-table">
            <thead>
                <tr>
                    <th>Horário</th>
    `;
    
    if (turma.turno === 'matutino') {
        config.dias.forEach(dia => {
            html += `<th>${formatDiaName(dia)}</th>`;
        });
    } else {
        config.dias.forEach(dia => {
            html += `<th>${formatDiaName(dia)}</th>`;
        });
    }
    
    html += '</tr></thead><tbody>';
    
    if (turma.turno === 'matutino') {
        config.blocos.forEach(bloco => {
            html += `<tr><td class="horario-label">${bloco.inicio} - ${bloco.fim}</td>`;
            
            config.dias.forEach(dia => {
                const horario = horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id);
                html += '<td class="horario-cell">';
                
                if (horario) {
                    const disciplina = appData.disciplinas.find(d => d.id === horario.idDisciplina);
                    const professor = appData.professores.find(p => p.id === horario.idProfessor);
                    const sala = appData.salas.find(s => s.id === horario.idSala);
                    
                    html += `
                        <div class="print-horario-info">
                            <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                            <div class="professor">${professor?.nome || 'N/A'}</div>
                            <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                        </div>
                    `;
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        });
    } else {
        // Noturno
        const maxBlocos = Math.max(...config.dias.map(dia => config.blocos[dia].length));
        
        for (let i = 0; i < maxBlocos; i++) {
            html += '<tr>';
            
            const horarios = config.dias.map(dia => {
                const bloco = config.blocos[dia][i];
                return bloco ? `${bloco.inicio} - ${bloco.fim}` : '';
            }).filter(h => h);
            
            const horarioUnico = [...new Set(horarios)];
            html += `<td class="horario-label">${horarioUnico.join(' / ')}</td>`;
            
            config.dias.forEach(dia => {
                const bloco = config.blocos[dia][i];
                html += '<td class="horario-cell">';
                
                if (bloco) {
                    const horario = horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id);
                    
                    if (horario) {
                        const disciplina = appData.disciplinas.find(d => d.id === horario.idDisciplina);
                        const professor = appData.professores.find(p => p.id === horario.idProfessor);
                        const sala = appData.salas.find(s => s.id === horario.idSala);
                        
                        html += `
                            <div class="print-horario-info">
                                <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                                <div class="professor">${professor?.nome || 'N/A'}</div>
                                <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                            </div>
                        `;
                    }
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        }
    }
    
    html += '</tbody></table>';
    
    html += `
        <div class="print-footer">
            <button class="btn btn-primary" onclick="printPage()">
                <i class="fas fa-print"></i>
                Imprimir
            </button>
            <button class="btn btn-secondary" onclick="closePrintPreview()">
                <i class="fas fa-times"></i>
                Fechar
            </button>
        </div>
    `;
    
    preview.innerHTML = html;
    
    // Scroll to preview
    preview.scrollIntoView({ behavior: 'smooth' });
}

function generateProfessorPrint(professorId) {
    const professor = appData.professores.find(p => p.id === professorId);
    if (!professor) return;
    
    const preview = document.getElementById('print-preview');
    preview.classList.remove('hidden');
    
    const horariosData = appData.horarios.filter(h => h.idProfessor === professorId);
    
    // Group by turno
    const horariosPorTurno = {
        matutino: horariosData.filter(h => {
            const turma = appData.turmas.find(t => t.id === h.idTurma);
            return turma?.turno === 'matutino';
        }),
        noturno: horariosData.filter(h => {
            const turma = appData.turmas.find(t => t.id === h.idTurma);
            return turma?.turno === 'noturno';
        })
    };
    
    let html = `
        <div class="print-header">
            <h2>Horário do Professor - ${professor.nome}</h2>
            <p>Curso: Ciências Econômicas - UESC</p>
            <p>Email: ${professor.email || 'Não informado'}</p>
            <p>Gerado em: ${formatDateTime(new Date())}</p>
        </div>
    `;
    
    // Matutino
    if (horariosPorTurno.matutino.length > 0) {
        html += '<h3>Turno Matutino</h3>';
        html += generateProfessorTurnoTable('matutino', horariosPorTurno.matutino);
    }
    
    // Noturno
    if (horariosPorTurno.noturno.length > 0) {
        html += '<h3>Turno Noturno</h3>';
        html += generateProfessorTurnoTable('noturno', horariosPorTurno.noturno);
    }
    
    if (horariosData.length === 0) {
        html += '<p class="no-activity">Este professor não possui horários cadastrados.</p>';
    }
    
    html += `
        <div class="print-footer">
            <button class="btn btn-primary" onclick="printPage()">
                <i class="fas fa-print"></i>
                Imprimir
            </button>
            <button class="btn btn-secondary" onclick="closePrintPreview()">
                <i class="fas fa-times"></i>
                Fechar
            </button>
        </div>
    `;
    
    preview.innerHTML = html;
    preview.scrollIntoView({ behavior: 'smooth' });
}

function generateProfessorTurnoTable(turno, horariosData) {
    const config = HORARIOS_CONFIG[turno];
    
    let html = `
        <table class="grade-horarios print-table">
            <thead>
                <tr>
                    <th>Horário</th>
    `;
    
    config.dias.forEach(dia => {
        html += `<th>${formatDiaName(dia)}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    if (turno === 'matutino') {
        config.blocos.forEach(bloco => {
            html += `<tr><td class="horario-label">${bloco.inicio} - ${bloco.fim}</td>`;
            
            config.dias.forEach(dia => {
                const horario = horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id);
                html += '<td class="horario-cell">';
                
                if (horario) {
                    const disciplina = appData.disciplinas.find(d => d.id === horario.idDisciplina);
                    const turma = appData.turmas.find(t => t.id === horario.idTurma);
                    const sala = appData.salas.find(s => s.id === horario.idSala);
                    
                    html += `
                        <div class="print-horario-info">
                            <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                            <div class="turma">${turma?.nome || 'N/A'}</div>
                            <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                        </div>
                    `;
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        });
    } else {
        // Noturno
        const maxBlocos = Math.max(...config.dias.map(dia => config.blocos[dia].length));
        
        for (let i = 0; i < maxBlocos; i++) {
            html += '<tr>';
            
            const horarios = config.dias.map(dia => {
                const bloco = config.blocos[dia][i];
                return bloco ? `${bloco.inicio} - ${bloco.fim}` : '';
            }).filter(h => h);
            
            const horarioUnico = [...new Set(horarios)];
            html += `<td class="horario-label">${horarioUnico.join(' / ')}</td>`;
            
            config.dias.forEach(dia => {
                const bloco = config.blocos[dia][i];
                html += '<td class="horario-cell">';
                
                if (bloco) {
                    const horario = horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id);
                    
                    if (horario) {
                        const disciplina = appData.disciplinas.find(d => d.id === horario.idDisciplina);
                        const turma = appData.turmas.find(t => t.id === horario.idTurma);
                        const sala = appData.salas.find(s => s.id === horario.idSala);
                        
                        html += `
                            <div class="print-horario-info">
                                <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                                <div class="turma">${turma?.nome || 'N/A'}</div>
                                <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                            </div>
                        `;
                    }
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        }
    }
    
    html += '</tbody></table>';
    return html;
}

function printPage() {
    window.print();
}

function closePrintPreview() {
    const preview = document.getElementById('print-preview');
    preview.classList.add('hidden');
    preview.innerHTML = '';
}

