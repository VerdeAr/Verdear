(() => {
	const POLL_INTERVAL = 8000;

	async function atualizar() {
		try {
			const resp = await fetch("/chat/nao-lidas/count");
			if (!resp.ok) return;
			const data = await resp.json();
			if (!data.success) return;
			if (data.total > 0) {
				document.title = `(${data.total}) Verdear | Conversas`;
			} else {
				document.title = "Verdear | Conversas";
			}
		} catch (e) {
			// silencioso
		}
	}

	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") {
			window.location.reload();
		}
	});

	setInterval(atualizar, POLL_INTERVAL);
})();
