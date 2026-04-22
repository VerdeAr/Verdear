(() => {
	const chatId = document.body.dataset.chatId;
	const userId = Number(document.body.dataset.userId);
	const messagesEl = document.getElementById("messages");
	const form = document.getElementById("composer");
	const input = document.getElementById("input-mensagem");
	const btnEnviar = document.getElementById("btn-enviar");
	const btnFinalizar = document.getElementById("btn-finalizar");
	const statusDot = document.getElementById("status-dot");
	const statusText = document.getElementById("status-text");

	const POLL_INTERVAL = 3000;
	let ultimoId = 0;
	let polling = true;

	const emptyChat = document.querySelector(".empty-chat");

	document.querySelectorAll(".message").forEach((el) => {
		const id = Number(el.dataset.id);
		if (id > ultimoId) ultimoId = id;
	});

	function escapeHtml(str) {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	function renderMensagem(msg) {
		if (emptyChat) emptyChat.remove();

		const wrapper = document.createElement("div");
		wrapper.className = `message ${msg.propria ? "own" : "other"} new`;
		wrapper.dataset.id = msg.id_mensagem;
		wrapper.innerHTML = `
            <div class="bubble">
                <p>${escapeHtml(msg.conteudo)}</p>
                <span class="hora">${msg.hora}</span>
            </div>
        `;
		messagesEl.appendChild(wrapper);
	}

	function scrollToBottom() {
		messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	function atualizarStatus(online) {
		if (!statusDot || !statusText) return;
		if (online) {
			statusDot.classList.add("online");
			statusDot.classList.remove("offline");
			statusText.textContent = "Online";
		} else {
			statusDot.classList.add("offline");
			statusDot.classList.remove("online");
			statusText.textContent = "Offline";
		}
	}

	async function solicitarPermissaoNotificacao() {
		if (!("Notification" in window)) return;
		if (Notification.permission === "default") {
			try {
				await Notification.requestPermission();
			} catch (e) {
				// ignorar
			}
		}
	}

	function notificar(msg) {
		if (!("Notification" in window)) return;
		if (Notification.permission !== "granted") return;
		if (document.visibilityState === "visible") return;

		const n = new Notification("Nova mensagem no Verdear", {
			body: msg.conteudo.slice(0, 120),
			icon: "/logo_simplificada.png",
			tag: `chat-${chatId}`,
		});
		n.onclick = () => {
			window.focus();
			n.close();
		};
	}

	async function enviar(conteudo) {
		btnEnviar.disabled = true;
		try {
			const resp = await fetch(`/chat/${chatId}/mensagem`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ conteudo }),
			});
			const data = await resp.json();
			if (!resp.ok || !data.success) {
				alert(data.mensagem || "Erro ao enviar mensagem");
				return;
			}
			renderMensagem(data.mensagem);
			ultimoId = Math.max(ultimoId, data.mensagem.id_mensagem);
			scrollToBottom();
		} catch (e) {
			alert("Falha de conexão ao enviar a mensagem");
		} finally {
			btnEnviar.disabled = false;
		}
	}

	async function buscarNovas() {
		if (!polling) return;
		try {
			const resp = await fetch(`/chat/${chatId}/mensagens?apos=${ultimoId}`);
			if (!resp.ok) return;
			const data = await resp.json();
			if (!data.success) return;

			atualizarStatus(data.online);

			if (data.mensagens && data.mensagens.length > 0) {
				const estavaNoFim =
					messagesEl.scrollHeight -
						messagesEl.scrollTop -
						messagesEl.clientHeight <
					80;

				data.mensagens.forEach((msg) => {
					renderMensagem(msg);
					ultimoId = Math.max(ultimoId, msg.id_mensagem);
					if (!msg.propria) notificar(msg);
				});

				if (estavaNoFim) scrollToBottom();
			}
		} catch (e) {
			// ignorar erros transientes
		}
	}

	form.addEventListener("submit", (ev) => {
		ev.preventDefault();
		const conteudo = input.value.trim();
		if (!conteudo) return;
		input.value = "";
		input.style.height = "auto";
		enviar(conteudo);
	});

	input.addEventListener("input", () => {
		input.style.height = "auto";
		input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
	});

	input.addEventListener("keydown", (ev) => {
		if (ev.key === "Enter" && !ev.shiftKey) {
			ev.preventDefault();
			form.requestSubmit();
		}
	});

	if (btnFinalizar) {
		btnFinalizar.addEventListener("click", async () => {
			if (!confirm("Deseja finalizar essa conversa?")) return;
			try {
				const resp = await fetch(`/chat/${chatId}/finalizar`, {
					method: "POST",
				});
				const data = await resp.json();
				if (data.success) {
					window.location.href = "/chat";
				} else {
					alert(data.mensagem || "Erro ao finalizar");
				}
			} catch (e) {
				alert("Falha ao finalizar a conversa");
			}
		});
	}

	document.addEventListener("visibilitychange", () => {
		polling = document.visibilityState === "visible";
		if (polling) buscarNovas();
	});

	scrollToBottom();
	solicitarPermissaoNotificacao();
	setInterval(buscarNovas, POLL_INTERVAL);
})();
