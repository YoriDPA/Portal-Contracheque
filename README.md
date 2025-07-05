<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - RH</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        /* Esconde o conteúdo por padrão até a verificação */
        #main-content, #edit-modal { display: none; }
    </style>
</head>
<body class="bg-gray-100">

    <!-- Barra de Navegação -->
    <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <h1 class="text-xl font-bold text-red-600">Painel Administrativo</h1>
                <button id="logoutButton" class="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600" style="display: none;">
                    Sair
                </button>
            </div>
        </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main id="main-content" class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- O conteúdo existente do painel (formulários, listas, etc.) permanece aqui -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Coluna 1: Gerir Funcionários -->
            <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
                <h2 class="text-2xl font-bold text-gray-800">Gerir Funcionários</h2>
                <div class="border border-gray-200 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3 text-gray-700">Adicionar Novo Funcionário</h3>
                    <form id="addEmployeeForm" class="space-y-4">
                        <div>
                            <label for="nome" class="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" id="nome" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                        <div>
                            <label for="cpf" class="block text-sm font-medium text-gray-700">CPF (formato: 000.000.000-00)</label>
                            <input type="text" id="cpf" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" maxlength="14">
                        </div>
                        <div>
                            <label for="matricula" class="block text-sm font-medium text-gray-700">Matrícula</label>
                            <input type="text" id="matricula" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                        <div id="addEmployeeMessage" class="text-sm text-center"></div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                            Salvar Funcionário
                        </button>
                    </form>
                </div>
                <div>
                    <h3 class="font-semibold text-lg mb-3 text-gray-700">Funcionários Cadastrados</h3>
                    <div class="mb-4">
                        <input type="text" id="searchEmployeeInput" placeholder="Pesquisar por nome, CPF ou matrícula..." class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <ul id="employeeList" class="space-y-2 max-h-96 overflow-y-auto border p-2 rounded-md">
                        <li class="text-center text-gray-500">A carregar...</li>
                    </ul>
                </div>
            </div>
            <!-- Coluna 2: Gerir Contracheques -->
            <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
                <h2 class="text-2xl font-bold text-gray-800">Gerir Contracheques</h2>
                <form id="uploadForm" class="space-y-4 border border-gray-200 p-4 rounded-lg">
                     <div>
                        <label for="select-funcionario" class="block text-sm font-medium text-gray-700">Selecione o Funcionário</label>
                        <select id="select-funcionario" required class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option>A carregar...</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="mes" class="block text-sm font-medium text-gray-700">Mês</label>
                            <select id="mes" required class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="01">Janeiro</option><option value="02">Fevereiro</option><option value="03">Março</option><option value="04">Abril</option><option value="05">Maio</option><option value="06">Junho</option><option value="07">Julho</option><option value="08">Agosto</option><option value="09">Setembro</option><option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
                            </select>
                        </div>
                        <div>
                            <label for="ano" class="block text-sm font-medium text-gray-700">Ano</label>
                            <input type="number" id="ano" value="2025" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Ficheiro do Contracheque (PDF)</label>
                        <input id="file-upload" type="file" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept=".pdf" required>
                    </div>
                    <div id="uploadMessage" class="text-sm text-center"></div>
                    <button type="submit" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                        Enviar Contracheque
                    </button>
                </form>
                <div id="payslip-management" style="display: none;">
                    <h3 class="font-semibold text-lg mb-3 text-gray-700">Contracheques Enviados</h3>
                    <ul id="payslipListAdmin" class="space-y-2"></ul>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal de Edição -->
    <div id="edit-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Editar Funcionário</h3>
                <div class="mt-2 px-7 py-3">
                    <form id="editEmployeeForm" class="space-y-4">
                        <input type="hidden" id="edit-rowIndex">
                        <div>
                            <label for="edit-nome" class="text-left block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" id="edit-nome" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        </div>
                        <div>
                            <label for="edit-cpf" class="text-left block text-sm font-medium text-gray-700">CPF (não editável)</label>
                            <input type="text" id="edit-cpf" readonly class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                        </div>
                        <div>
                            <label for="edit-matricula" class="text-left block text-sm font-medium text-gray-700">Matrícula</label>
                            <input type="text" id="edit-matricula" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        </div>
                        <div id="editEmployeeMessage" class="text-sm text-center"></div>
                    </form>
                </div>
                <div class="items-center px-4 py-3">
                    <button id="saveEditButton" class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700">
                        Salvar Alterações
                    </button>
                    <button id="closeModalButton" class="mt-2 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // --- SCRIPT DO PAINEL ADMINISTRATIVO ---
        const mainContent = document.getElementById('main-content');
        const logoutButton = document.getElementById('logoutButton');
        const editModal = document.getElementById('edit-modal');
        let adminPassword = '';
        let employeesData = [];

        // NOVA LÓGICA DE VERIFICAÇÃO
        function checkAuth() {
            const storedPassword = sessionStorage.getItem('adminPassword');
            if (storedPassword) {
                adminPassword = storedPassword;
                mainContent.style.display = 'block';
                logoutButton.style.display = 'block';
                loadEmployees();
            } else {
                // Se não houver senha, redireciona para a nova página de login
                window.location.href = './admin-login.html';
            }
        }

        // Carregar funcionários
        async function loadEmployees() {
            try {
                const response = await fetch('/api/employees', { headers: { 'Authorization': `Bearer ${adminPassword}` } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                employeesData = data.employees;
                renderEmployeeList(employeesData);

                const employeeSelect = document.getElementById('select-funcionario');
                employeeSelect.innerHTML = '<option value="">-- Selecione --</option>';
                if (employeesData.length > 0) {
                    employeesData.forEach(emp => {
                        const optionItem = document.createElement('option');
                        optionItem.value = emp.matricula;
                        optionItem.textContent = `${emp.nome} (Mat: ${emp.matricula})`;
                        employeeSelect.appendChild(optionItem);
                    });
                }
            } catch (error) {
                alert(`Erro ao carregar funcionários: ${error.message}`);
                sessionStorage.removeItem('adminPassword'); // Limpa a senha inválida
                window.location.href = './admin-login.html'; // Redireciona se houver erro
            }
        }

        function renderEmployeeList(employeesToRender) {
            const employeeList = document.getElementById('employeeList');
            employeeList.innerHTML = '';
            if (employeesToRender.length > 0) {
                employeesToRender.forEach(emp => {
                    const listItem = document.createElement('li');
                    listItem.className = 'flex justify-between items-center p-2 bg-gray-50 rounded-md';
                    listItem.innerHTML = `
                        <div>
                            <span class="font-medium">${emp.nome}</span>
                            <span class="block text-xs text-gray-500">CPF: ${emp.cpf} | Mat: ${emp.matricula}</span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="openEditModal('${emp.cpf}')" class="text-blue-600 hover:text-blue-900 text-xs">Editar</button>
                            <button onclick="deleteEmployee('${emp.cpf}')" class="text-red-600 hover:text-red-900 text-xs">Apagar</button>
                        </div>
                    `;
                    employeeList.appendChild(listItem);
                });
            } else {
                employeeList.innerHTML = '<li class="text-center text-gray-500">Nenhum funcionário encontrado.</li>';
            }
        }

        document.getElementById('searchEmployeeInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredEmployees = employeesData.filter(emp => 
                emp.nome.toLowerCase().includes(searchTerm) ||
                emp.cpf.includes(searchTerm) ||
                emp.matricula.includes(searchTerm)
            );
            renderEmployeeList(filteredEmployees);
        });

        // (Restante do código JS existente, sem alterações)
        const payslipManagementDiv = document.getElementById('payslip-management');
        const payslipListAdmin = document.getElementById('payslipListAdmin');
        const employeeSelect = document.getElementById('select-funcionario');
        async function loadPayslips(matricula) {
            if (!matricula) { payslipManagementDiv.style.display = 'none'; return; }
            payslipManagementDiv.style.display = 'block';
            payslipListAdmin.innerHTML = '<li>A carregar...</li>';
            try {
                const response = await fetch(`/api/payslips?matricula=${matricula}`, { headers: { 'Authorization': `Bearer ${adminPassword}` } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                payslipListAdmin.innerHTML = '';
                if (data.files.length > 0) {
                    data.files.forEach(file => {
                        const listItem = document.createElement('li');
                        listItem.className = 'flex justify-between items-center p-2 bg-gray-50 rounded-md';
                        listItem.innerHTML = `<span>${file.name}</span><button onclick="deletePayslip('${file.id}', '${file.name}')" class="text-red-600 hover:text-red-900 text-xs">Apagar</button>`;
                        payslipListAdmin.appendChild(listItem);
                    });
                } else {
                    payslipListAdmin.innerHTML = '<li>Nenhum contracheque encontrado para este funcionário.</li>';
                }
            } catch (error) { payslipListAdmin.innerHTML = `<li>Erro ao carregar ficheiros: ${error.message}</li>`; }
        }
        async function deletePayslip(fileId, fileName) {
            if (confirm(`Tem a certeza que quer apagar o ficheiro ${fileName}?`)) {
                try {
                    const response = await fetch('/api/payslips', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPassword}` },
                        body: JSON.stringify({ fileId })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    alert(data.message);
                    loadPayslips(employeeSelect.value);
                } catch (error) { alert(`Erro ao apagar o ficheiro: ${error.message}`); }
            }
        }
        employeeSelect.addEventListener('change', (e) => loadPayslips(e.target.value));
        function openEditModal(cpf) {
            const employee = employeesData.find(emp => emp.cpf === cpf);
            if (employee) {
                document.getElementById('edit-rowIndex').value = employee.rowIndex;
                document.getElementById('edit-nome').value = employee.nome;
                document.getElementById('edit-cpf').value = employee.cpf;
                document.getElementById('edit-matricula').value = employee.matricula;
                editModal.style.display = 'block';
            }
        }
        function closeModal() { editModal.style.display = 'none'; }
        async function saveEmployeeChanges() {
            const messageDiv = document.getElementById('editEmployeeMessage');
            messageDiv.textContent = 'A guardar...';
            const updatedEmployee = {
                rowIndex: document.getElementById('edit-rowIndex').value,
                nome: document.getElementById('edit-nome').value,
                matricula: document.getElementById('edit-matricula').value,
            };
            try {
                const response = await fetch('/api/employees', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPassword}` },
                    body: JSON.stringify(updatedEmployee)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                messageDiv.textContent = data.message;
                messageDiv.className = 'text-sm text-center text-green-600';
                setTimeout(() => { closeModal(); loadEmployees(); }, 1500);
            } catch (error) {
                 messageDiv.textContent = `Erro: ${error.message}`;
                 messageDiv.className = 'text-sm text-center text-red-600';
            }
        }
        async function deleteEmployee(cpf) {
            const employee = employeesData.find(emp => emp.cpf === cpf);
            if (employee && confirm(`Tem a certeza que quer apagar o funcionário ${employee.nome}? Esta ação não pode ser desfeita.`)) {
                try {
                    const response = await fetch('/api/employees', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPassword}` },
                        body: JSON.stringify({ rowIndex: employee.rowIndex })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    alert(data.message);
                    loadEmployees();
                } catch (error) { alert(`Erro ao apagar funcionário: ${error.message}`); }
            }
        }
        document.getElementById('saveEditButton').addEventListener('click', saveEmployeeChanges);
        document.getElementById('closeModalButton').addEventListener('click', closeModal);
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('adminPassword');
            window.location.href = './admin-login.html';
        });
        document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('addEmployeeMessage');
            messageDiv.textContent = 'A guardar...';
            const newEmployee = {
                nome: document.getElementById('nome').value,
                cpf: document.getElementById('cpf').value,
                matricula: document.getElementById('matricula').value,
            };
            try {
                const response = await fetch('/api/employees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPassword}` },
                    body: JSON.stringify(newEmployee)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                messageDiv.textContent = data.message;
                messageDiv.className = 'text-sm text-center text-green-600';
                e.target.reset();
                loadEmployees();
            } catch (error) { messageDiv.textContent = `Erro: ${error.message}`; messageDiv.className = 'text-sm text-center text-red-600'; }
        });
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('uploadMessage');
            const submitButton = e.target.querySelector('button');
            messageDiv.textContent = 'A carregar ficheiro...';
            submitButton.disabled = true;
            const matricula = document.getElementById('select-funcionario').value;
            const ano = document.getElementById('ano').value;
            const mes = document.getElementById('mes').value;
            const fileInput = document.getElementById('file-upload');
            if (!matricula || !fileInput.files[0]) {
                messageDiv.textContent = 'Selecione um funcionário e um ficheiro.';
                submitButton.disabled = false;
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const fileData = reader.result;
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminPassword}` },
                        body: JSON.stringify({ matricula, ano, mes, fileData: fileData, fileType: file.type })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    messageDiv.textContent = data.message;
                    messageDiv.className = 'text-sm text-center text-green-600';
                    e.target.reset();
                    loadPayslips(matricula);
                } catch (error) {
                    messageDiv.textContent = `Erro: ${error.message}`;
                    messageDiv.className = 'text-sm text-center text-red-600';
                } finally { submitButton.disabled = false; }
            };
            reader.onerror = () => {
                messageDiv.textContent = 'Erro ao ler o ficheiro.';
                submitButton.disabled = false;
            };
        });
        const cpfInput = document.getElementById('cpf');
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
            else if (value.length > 3) value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
            e.target.value = value;
        });

        // Inicia a verificação de autenticação ao carregar a página
        window.addEventListener('DOMContentLoaded', checkAuth);
    </script>
</body>
</html>
