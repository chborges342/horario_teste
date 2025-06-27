// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDvQk4y2cZz7X3X8pzQ6yLd9QwVb3a1b2c3",
    authDomain: "horarios-uesc.firebaseapp.com",
    projectId: "horarios-uesc",
    storageBucket: "horarios-uesc.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referências para as coleções
const professoresRef = db.collection('professores');
const disciplinasRef = db.collection('disciplinas');
const turmasRef = db.collection('turmas');
const salasRef = db.collection('salas');
const horariosRef = db.collection('horarios');

// Objetos para armazenar dados em cache
let professores = [];
let disciplinas = [];
let turmas = [];
let salas = [];
let horarios = [];

// Mapeamento de períodos para horários
const periodos = {
    1: { start: '7:30', end: '8:20', turno: 'matutino' },
    2: { start: '8:20', end: '9:10', turno: 'matutino' },
    3: { start: '9:10', end: '10:00', turno: 'matutino' },
    4: { start: '10:00', end: '极端的
    turno: 'matutino' },
    5: { start: '10:50', end: '11:40', turno: 'matutino' },
    6: { start: '11:40', end: '12:30', turno: 'matutino' },
    7: { start: '18:40', end: '19:30', turno: 'noturno' },
    8: { start: '19:30', end: '20:20', turno: 'noturno' },
    9: { start: '20:20', end: '21:10', turno: 'noturno' },
    10: { start: '21:10', end: '22:00', turno: 'noturno' }
};

// Dias da semana
const dias = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

// Mostrar loading
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Esconder loading
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Carregar todos os dados do Firebase
async function loadAllData() {
    showLoading();
    
    try {
        // Carregar professores
        const professoresSnapshot = await professoresRef.get();
        professores = professoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Carregar disciplinas
        const disciplinasSnapshot = await disciplinasRef.get();
        disciplinas = disciplinasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Carregar turmas
        const turmasSnapshot = await turmasRef.get();
        turmas = turmasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Carregar salas
        const salasSnapshot = await salasRef.get();
        salas = salasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Carregar horários
        const horariosSnapshot = await horariosRef.get();
        horarios = horariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Atualizar contadores
        document.getElementById('professorCount').textContent = professores.length;
        document.getElementById('disciplineCount').textContent = disciplinas.length;
        document.getElementById('classCount').textContent = turmas.length;
        document.getElementById('scheduleCount').textContent = horarios.length;
        
        // Renderizar listas
        renderProfessores();
        renderDisciplinas();
        renderTurmas();
        renderSalas();
        renderHorarios();
        
        // Preencher selects
        fillSelects();
        
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados. Verifique o console para mais detalhes.");
    } finally {
        hideLoading();
    }
}

// Renderizar lista de professores
function renderProfessores() {
    const tbody = document.getElementById('professorsList');
    tbody.innerHTML = '';
    
    professores.forEach(prof => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prof.codigo}</td>
            <td>${prof.nome}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteProfessor('${prof.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderizar lista de disciplinas
function renderDisciplinas() {
    const tbody = document.getElementById('disciplinesList');
    tbody.innerHTML = '';
    
    disciplinas.forEach(disciplina => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${disciplina.codigo}</td>
            <td>${disciplina.nome}</td>
            <td>${disciplina.semestre}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteDiscipline('${disciplina.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderizar lista de turmas
function renderTurmas() {
    const tbody = document.getElementById('classesList');
    tbody.innerHTML = '';
    
    turmas.forEach(turma => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${turma.codigo}</td>
            <td>${turma.turno}</td>
            <td>${turma.semestre}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteClass('${turma.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderizar lista de salas
function renderSalas() {
    const tbody = document.getElementById('roomsList');
    tbody.innerHTML = '';
    
    salas.forEach(sala => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sala.nome}</td>
            <td>${sala.capacidade}</td>
            <td>${sala.localizacao}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteRoom('${sala.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderizar lista de horários
function renderHorarios() {
    const tbody = document.getElementById('schedulesList');
    tbody.innerHTML = '';
    
    horarios.forEach(horario => {
        const periodo = periodos[horario.periodo];
        const turma = turmas.find(t => t.id === horario.turmaId);
        const disciplina = disciplinas.find(d => d.id === horario.disciplinaId);
        const professor = professores.find(p => p.id === horario.professorId);
        const sala = salas.find(s => s.id === horario.salaId);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${turma ? turma.codigo : 'N/A'}</td>
            <td>${disciplina ? disciplina.nome : 'N/A'}</td>
            <td>${professor ? professor.nome : 'N/A'}</td>
            <td>${horario.dia} (${periodo.start}-${periodo.end})</td>
            <td>${sala ? sala.nome : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSchedule('${horario.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Preencher selects dependentes
function fillSelects() {
    // Preencher selects na aba de horários
    const scheduleClassSelect = document.getElementById('scheduleClass');
    const scheduleDisciplineSelect = document.getElementById('scheduleDiscipline');
    const scheduleProfessorSelect = document.getElementById('scheduleProfessor');
    const scheduleRoomSelect = document.getElementById('scheduleRoom');
    
    scheduleClassSelect.innerHTML = '';
    scheduleDisciplineSelect.innerHTML = '';
    scheduleProfessorSelect.innerHTML = '';
    scheduleRoomSelect.innerHTML = '';
    
    turmas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma.id;
        option.textContent = `${turma.codigo} - ${turma.turno} (Sem ${turma.semestre})`;
        scheduleClassSelect.appendChild(option);
    });
    
    disciplinas.forEach(disciplina => {
        const option = document.createElement('option');
        option.value = disciplina.id;
        option.textContent = `${disciplina.codigo} - ${disciplina.nome} (Sem ${disciplina.semestre})`;
        scheduleDisciplineSelect.appendChild(option);
    });
    
    professores.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof.id;
        option.textContent = `${prof.codigo} - ${prof.nome}`;
        scheduleProfessorSelect.appendChild(option);
    });
    
    salas.forEach(sala => {
        const option = document.createElement('option');
        option.value = sala.id;
        option.textContent = `${sala.nome} (${sala.localizacao})`;
        scheduleRoomSelect.appendChild(option);
    });
    
    // Preencher selects na seção de quadros
    const selectClassSchedule = document.getElementById('selectClassSchedule');
    const selectProfessorSchedule = document.getElementById('selectProfessorSchedule');
    
    selectClassSchedule.innerHTML = '';
    turmas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma.id;
        option.textContent = `${turma.codigo} - Sem ${turma.semestre} (${turma.turno})`;
        selectClassSchedule.appendChild(option);
    });
    
    professores.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof.id;
        option.text
        option.textContent = `${prof.codigo} - ${prof.nome}`;
        selectProfessorSchedule.appendChild(option);
    });
    
    // Preencher select de impressão
    const printItemSelect = document.getElementById('printItem');
    printItemSelect.innerHTML = '';
    
    if (document.getElementById('printType').value === 'turma') {
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = `${turma.codigo} - Sem ${turma.semestre} (${turma.turno})`;
            printItemSelect.appendChild(option);
        });
    } else {
        professores.forEach(prof => {
            const option = document.createElement('option');
            option.value = prof.id;
            option.textContent = `${prof.codigo} - ${prof.nome}`;
            printItemSelect.appendChild(option);
        });
    }
}

// Adicionar professor
document.getElementById('addProfessor').addEventListener('click', async () => {
    const nome = document.getElementById('professorName').value;
    const codigo = document.getElementById('professorCode').value;
    
    if (!nome || !codigo) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    try {
        showLoading();
        await professoresRef.add({
            nome: nome,
            codigo: codigo
        });
        await loadAllData();
        document.getElementById('professorName').value = '';
        document.getElementById('professorCode').value = '';
    } catch (error) {
        console.error("Erro ao adicionar professor:", error);
        alert("Erro ao adicionar professor");
    } finally {
        hideLoading();
    }
});

// Adicionar disciplina
document.getElementById('addDiscipline').addEventListener('极端的
document.getElementById('addDiscipline').addEventListener('click', async () => {
    const nome = document.getElementById('disciplineName').value;
    const codigo = document.getElementById('disciplineCode').value;
    const semestre = parseInt(document.getElementById('disciplineSemester').value);
    
    if (!nome || !codigo || !semestre) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    try {
        showLoading();
        await disciplinasRef.add({
            nome: nome,
            codigo: codigo,
            semestre: semestre
        });
        await loadAllData();
        document.getElementById('disciplineName').value = '';
        document.getElementById('disciplineCode').value = '';
        document.getElementById('disciplineSemester').value = '';
    } catch (error) {
        console.error("Erro ao adicionar disciplina:", error);
        alert("Erro ao adicionar disciplina");
    } finally {
        hideLoading();
    }
});

// Adicionar turma
document.getElementById('addClass').addEventListener('click', async () => {
    const codigo = document.getElementById('classCode').value;
    const turno = document.getElementById('classShift').value;
    const semestre = parseInt(document.getElementById('classSemester').value);
    
    if (!codigo || !turn极端的
    if (!codigo || !turno || !semestre) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    try {
        showLoading();
        await turmasRef.add({
            codigo: codigo,
            turno: turno,
            semestre: semestre
        });
        await loadAllData();
        document.getElementById('classSemester').value = '';
    } catch (error) {
        console.error("Erro ao adicionar turma:", error);
        alert("Erro ao adicionar turma");
    } finally {
        hideLoading();
    }
});

// Adicionar sala
document.getElementById('addRoom').addEventListener('click', async () => {
    const nome = document.getElementById('roomName').value;
    const capacidade = parseInt(document.getElementById('roomCapacity').value);
    const localizacao = document.getElementById('roomLocation').value;
    
    if (!nome || !capacidade || !localizacao) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    try {
        showLoading();
        await salasRef.add({
            nome: nome,
            capacidade: capacidade,
            localizacao: localizacao
        });
        await loadAllData();
        document.getElementById('roomName').value = '';
        document.getElementById('roomCapacity').value = '';
        document.getElementById('roomLocation').value = '';
    } catch (error) {
        console.error("Erro ao adicionar sala:", error);
        alert("Erro ao adicionar sala");
    } finally {
        hideLoading();
    }
});

// Adicionar horário com verificação de conflito
document.getElementById('addSchedule').addEventListener('click', async () => {
    const turmaId = document.getElementById('scheduleClass').value;
    const disciplinaId = document.getElementById('scheduleDiscipline').value;
    const professorId = document.getElementById('scheduleProfessor').value;
    const salaId = document.getElementById('scheduleRoom').value;
    const dia = document.getElementById('scheduleDay').value;
    const periodo = parseInt(document.getElementById('schedulePeriod').value);
    
    if (!turmaId || !disciplinaId || !professorId || !salaId || !dia || !periodo) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    // Verificar conflitos
    const conflitos = await checkForConflicts(professorId, salaId, dia, periodo);
    
    if (conflitos.professorConflict) {
        document.getElementById('conflictMessage').textContent = 
            `Conflito de horário para o professor no mesmo período!`;
        document.getElementById('conflictAlert').classList.remove('d-none');
        return;
    }
    
    if (conflitos.roomConflict) {
        document.getElementById('conflictMessage').textContent = 
            `Conflito de sala no mesmo período!`;
        document.getElementById('conflictAlert').classList.remove('d-none');
        return;
    }
    
    try {
        showLoading();
        await horariosRef.add({
            turmaId: turmaId,
            disciplinaId: disciplinaId,
            professorId: professorId,
            salaId: salaId,
            dia: dia,
            periodo: periodo
        });
        await loadAllData();
        document.getElementById('conflictAlert').classList.add('d-none');
    } catch (error) {
        console.error("Erro ao adicionar horário:", error);
        alert("Erro ao adicionar horário");
    } finally {
        hideLoading();
    }
});

// Verificar conflitos
async function checkForConflicts(professorId, salaId, dia, periodo) {
    const snapshot = await horariosRef
        .where('dia', '==', dia)
        .where('periodo', '==', periodo)
        .get();
    
    let professorConflict = false;
    let roomConflict = false;
    
    snapshot.forEach(doc => {
        const horario = doc.data();
        if (horario.professorId === professorId) {
            professorConflict = true;
        }
        if (horario.salaId === salaId) {
            roomConflict = true;
        }
    });
    
    return { professorConflict, roomConflict };
}

// Funções de exclusão
async function deleteProfessor(id) {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
        try {
            showLoading();
            await professoresRef.doc(id).delete();
            await loadAllData();
        } catch (error) {
            console.error("Erro ao excluir professor:", error);
            alert("Erro ao excluir professor");
        } finally {
            hideLoading();
        }
    }
}

async function deleteDiscipline(id) {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
        try {
            showLoading();
            await disciplinasRef.doc(id).delete();
            await loadAllData();
        } catch (error) {
            console.error("Erro ao excluir disciplina:", error);
            alert("Erro ao excluir disciplina");
        } finally {
            hideLoading();
        }
    }
}

async function deleteClass(id) {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
        try {
            showLoading();
            await turmasRef.doc(id).delete();
            await loadAllData();
        } catch (error) {
            console.error("Erro ao excluir turma:", error);
            alert("Erro ao excluir turma");
        } finally {
            hideLoading();
        }
    }
}

async function deleteRoom(id) {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
        try {
            showLoading();
            await salasRef.doc(id).delete();
            await loadAllData();
        } catch (error) {
            console.error("Erro ao excluir sala:", error);
            alert("Erro ao excluir sala");
        } finally {
            hideLoading();
        }
    }
}

async function deleteSchedule(id) {
    if (confirm('Tem certeza que deseja excluir este horário?')) {
        try {
            showLoading();
            await horariosRef.doc(id).delete();
            await loadAllData();
        } catch (error) {
            console.error("Erro ao excluir horário:", error);
            alert("Erro ao excluir horário");
        } finally {
            hideLoading();
        }
    }
}

// Carregar horário por turma
document.getElementById('loadClassSchedule').addEventListener('click', () => {
    const turmaId = document.getElementById('selectClassSchedule').value;
    renderClassSchedule(turmaId);
});

// Renderizar grade de horários para uma turma
function renderClassSchedule(turmaId) {
    const container = document.querySelector('#classScheduleContainer .schedule-grid');
    container.innerHTML = '';
    
    // Adicionar cabeçalhos
    container.innerHTML = `
        <div class="schedule-header">Horário</div>
        <div class="schedule-header">Segunda</div>
        <div class="schedule-header">Terça</div>
        <div class="schedule-header">Quarta</div>
        <div class="schedule-header">Quinta</div>
        <div class="schedule-header">Sexta</div>
        <div class="schedule-header">Sábado</div>
    `;
    
    // Adicionar períodos
    Object.keys(periodos).forEach(periodo => {
        const { start, end, turno } = periodos[periodo];
        const timeCell = document.createElement('div');
        timeCell.className = 'schedule-header';
        timeCell.textContent = `${start} - ${end}`;
        container.appendChild(timeCell);
        
        dias.forEach(dia => {
            const cell = document.createElement('div');
            cell.className = 'schedule-cell';
            cell.dataset.dia = dia;
            cell.dataset.periodo = periodo;
            
            // Encontrar horário para esta célula
            const horario = horarios.find(h => 
                h.turmaId === turmaId && 
                h.dia === dia && 
                h.periodo === parseInt(periodo)
            );
            
            if (horario) {
                const disciplina = disciplinas.find(d => d.id === horario.disciplinaId);
                const professor = professores.find(p => p.id === horario.professorId);
                const sala = salas.find(s => s.id === horario.salaId);
                
                cell.innerHTML = `
                    <div class="schedule-session">
                        <strong>${disciplina ? disciplina.nome : 'N/A'}</strong>
                        <div class="session-details">
                            ${professor ? professor.nome : 'N/A'}<br>
                            ${sala ? sala.nome : 'N/A'}
                        </div>
                    </div>
                `;
            }
            
            container.appendChild(cell);
        });
    });
}

// Carregar horário por professor
document.getElementById('loadProfessorSchedule').addEventListener('click', () => {
    const professorId = document.getElementById('selectProfessorSchedule').value;
    renderProfessorSchedule(professorId);
});

// Renderizar grade de horários para um professor
function renderProfessorSchedule(professorId) {
    const container = document.querySelector('#professorScheduleContainer .schedule-grid');
    container.innerHTML = '';
    
    // Adicionar cabeçalhos
    container.innerHTML = `
        <div class极端的
        <div class="schedule-header">Horário</div>
        <div class="schedule-header">Segunda</div>
        <div class="schedule-header">Terça</div>
       极端的
        <div class="schedule-header">Quarta</div>
        <div class="schedule-header">Quinta</div>
        <div class="schedule-header">Sexta</div>
        <div class="schedule-header">Sábado</div>
    `;
    
    // Adicionar períodos
    Object.keys(periodos).forEach(periodo => {
        const { start, end } = periodos[periodo];
        const timeCell = document.createElement('div');
        timeCell.className = 'schedule-header';
        timeCell.textContent = `${start} - ${end}`;
        container.appendChild(timeCell);
        
        dias.forEach(dia => {
            const cell = document.createElement('div');
            cell.className = 'schedule-cell';
            cell.dataset.dia = dia;
            cell.dataset.periodo = periodo;
            
            // Encontrar horário para esta célula
            const horario = horarios.find(h => 
                h.professorId === professorId && 
                h.dia === dia && 
                h.periodo === parseInt(periodo)
            );
            
            if (horario) {
                const disciplina = disciplinas.find(d => d.id === horario.disciplinaId);
                const turma = turmas.find(t => t.id === horario.turmaId);
                const sala = salas.find(s => s.id === horario.salaId);
                
                cell.innerHTML = `
                    <div class="schedule-session">
                        <strong>${disciplina ? disciplina.nome : 'N/A'}</strong>
                        <div class="session-details">
                            ${turma ? turma.codigo : 'N/A'}<br>
                            ${sala ? sala.nome : 'N/A'}
                        </div>
                    </div>
                `;
            }
            
            container.appendChild(c极端的
            container.appendChild(cell);
        });
    });
}

// Gerar conteúdo para impressão
document.getElementById('generatePrint').addEventListener('click', () => {
    const type = document.getElementById('printType').value;
    const itemId = document.getElementById('printItem').value;
    
    if (type === 'turma') {
        generateClassPrint(itemId);
    } else {
        generateProfessorPrint(itemId);
    }
});

// Alternar tipo de impressão
document.getElementById('printType').addEventListener('change', () => {
    fillSelects();
});

// Gerar impressão para turma
function generateClassPrint(turmaId) {
    const turma = turmas.find(t => t.id === turmaId);
    const title = document.getElementById('printTitle');
    const subtitle = document.getElementById('printSubtitle');
    const content = document.getElementById('printContent');
    
    title.textContent = `Quadro de Horários - Turma ${turma.codigo}`;
    subtitle.textContent = `Semestre: ${turma.semestre} | Turno: ${turma.turno}`;
    
    // Criar tabela de horários
    let tableHTML = `
        <table class="schedule-grid-print">
            <thead>
                <tr>
                    <th>Horário</th>
                    <th>Segunda</th>
                    <th>Terça</th>
                    <th>Quarta</th>
                    <th>Quinta</th>
                    <th>Sexta</th>
                    <th>Sábado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Adicionar linhas de horários
    Object.keys(periodos).forEach(periodo => {
        const { start, end } = periodos[periodo];
        tableHTML += `
            <tr>
                <td class="time-cell">${start}<br>${end}</td>
        `;
        
        dias.forEach(dia => {
            tableHTML += `<td>`;
            
            // Encontrar horário para esta célula
            const horario = horarios.find(h => 
                h.turmaId === turmaId && 
                h.dia === dia && 
                h.periodo === parseInt(periodo)
            );
            
            if (horario) {
                const disciplina = disciplinas.find(d => d.id === horario.disciplinaId);
                const professor = professores.find(p => p.id === horario.professorId);
                const sala = salas.find(s => s.id === horario.salaId);
                
                tableHTML += `
                    <div>
                        <strong>${disciplina ? disciplina.nome : 'N/A'}</strong><br>
                        ${professor ? professor.nome : 'N/A'}<br>
                        ${sala ? sala.nome : 'N/A'}
                    </div>
                `;
            }
            
            tableHTML += `</td>`;
        });
        
        tableHTML += `</tr>`;
    });
    
    tableHTML += `</tbody></table>`;
    content.innerHTML = tableHTML;
    
    // Atualizar data
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR');
}

// Gerar impressão para professor
function generateProfessorPrint(professorId) {
    const professor = professores.find(p => p.id === professorId);
    const title = document.getElementById('printTitle');
    const subtitle = document.getElementById('printSubtitle');
    const content = document.getElementById('printContent');
    
    title.textContent = `Quadro de Horários - Professor ${professor.nome}`;
    subtitle.textContent = `Código: ${professor.codigo}`;
    
    // Criar tabela de horários
    let tableHTML = `
        <table class="schedule-grid-print">
            <thead>
                <tr>
                    <th>Horário</th>
                    <th>Segunda</th>
                    <th>Terça</th>
                    <th>Quarta</th>
                    <th>Quinta</th>
                    <th>Sexta</th>
                    <th>Sábado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Adicionar linhas de horários
    Object.keys(periodos).forEach(periodo => {
        const { start, end } = periodos[periodo];
        tableHTML += `
            <tr>
                <td class="time-cell">${start}<br>${end}</td>
        `;
        
        dias.forEach(dia => {
            tableHTML += `<td>`;
            
            // Encontrar horário para esta célula
            const horario = horarios.find(h => 
                h.professorId === professorId && 
                h.dia === dia && 
                h.periodo === parseInt(periodo)
            );
            
            if (horario) {
                const disciplina = disciplinas.find(d => d.id === horario.disciplinaId);
                const turma = turmas.find(t => t.id === horario.turmaId);
                const sala = salas.find(s => s.id === horario.salaId);
                
                tableHTML += `
                    <div>
                        <strong>${disciplina ? disciplina.nome : 'N/A'}</strong><br>
                        ${turma ? turma.codigo : 'N/A'}<br>
                        ${sala ? sala.nome : 'N/A'}
                    </div>
                `;
            }
            
            tableHTML += `</td>`;
        });
        
        tableHTML += `</tr>`;
    });
    
    tableHTML += `</tbody></table>`;
    content.innerHTML = tableHTML;
    
    // Atualizar data
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR');
}

// Navegação entre seções
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remover classe active de todos os links
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe active ao link clicado
        this.classList.add('active');
        
        // Esconder todas as seções
        document.querySelectorAll('.container > div').forEach(section => {
            section.classList.add('d-none');
        });
        
        // Mostrar a seção correspondente
        const sectionId = this.getAttribute('data-section') + '-section';
        document.getElementById(sectionId).classList.remove('d-none');
    });
});

// Inicializar o sistema
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Carregar dados iniciais
    loadAllData();
    
    // Configurar data atual na impressão
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR');
});
