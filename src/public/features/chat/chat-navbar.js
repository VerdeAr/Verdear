(() => {
	const POLL_INTERVAL = 15000;

	const style = document.createElement("style");
	style.textContent = `
        .chat-nav-badge,
        .pedidos-nav-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background-color: #f39c12;
            color: #ffffff;
            font-size: 0.7em;
            font-weight: bold;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            border-radius: 9px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            line-height: 1;
        }
        .pedidos-nav-badge {
            background-color: #e74c3c;
        }
    `;
	document.head.appendChild(style);

	function atualizarBadgeGenerico(badge, total) {
		if (!badge) return;
		if (total > 0) {
			badge.textContent = total > 99 ? "99+" : String(total);
			badge.style.display = "inline-flex";
		} else {
			badge.style.display = "none";
		}
	}

	async function buscarContador() {
		try {
			const resp = await fetch("/chat/nao-lidas/count");
			if (!resp.ok) return;
			const data = await resp.json();
			if (data.success) {
				atualizarBadgeGenerico(
					document.getElementById("chat-nav-badge"),
					data.total,
				);
			}
		} catch (e) {
			// silencioso
		}
	}

	async function buscarPedidosPendentes() {
		const badge = document.getElementById("pedidos-nav-badge");
		if (!badge) return;
		try {
			const resp = await fetch("/vendedor/pedidos/pendentes/count");
			if (!resp.ok) return;
			const data = await resp.json();
			if (data.success) atualizarBadgeGenerico(badge, data.count);
		} catch (e) {
			// silencioso
		}
	}

	async function iniciarChat(body) {
		try {
			const resp = await fetch("/chat/iniciar", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const data = await resp.json();
			if (!resp.ok || !data.success) {
				alert(data.mensagem || "Não foi possível iniciar a conversa");
				return;
			}
			window.location.href = data.redirect;
		} catch (e) {
			alert("Falha de conexão ao iniciar a conversa");
		}
	}

	document.addEventListener("click", (ev) => {
		const btn = ev.target.closest("[data-chat-iniciar]");
		if (!btn) return;
		ev.preventDefault();
		ev.stopPropagation();
		const payload = {};
		if (btn.dataset.idProduto) payload.id_produto = btn.dataset.idProduto;
		if (btn.dataset.idVenda) payload.id_venda = btn.dataset.idVenda;
		if (btn.dataset.idVendedor) payload.id_vendedor = btn.dataset.idVendedor;
		iniciarChat(payload);
	});

	buscarContador();
	buscarPedidosPendentes();
	setInterval(buscarContador, POLL_INTERVAL);
	setInterval(buscarPedidosPendentes, POLL_INTERVAL);
})();
