import { Download, Shield, Zap, Bot } from "lucide-react";

const Index = () => {
  const handleDownload = () => {
    fetch("/rtrvr-super-agent.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "rtrvr-super-agent.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Bot className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">RTRVR Super Agent</h1>
          <p className="text-muted-foreground text-lg">Autonomous Research & Survey Navigator — a Chrome extension</p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Download Extension
          </button>
        </div>

        <div className="grid gap-6">
          {[
            { icon: Zap, title: "Autonomous Loop", desc: "Analyzes page elements and executes actions automatically." },
            { icon: Shield, title: "Content Script Injection", desc: "Interacts with any webpage via simulated user events." },
            { icon: Bot, title: "Background Intelligence", desc: "Service worker processes page data and dispatches commands." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-4 rounded-lg border border-border bg-card">
              <Icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-lg">Installation</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
            <li>Download and unzip the file</li>
            <li>Open <code className="bg-background px-1.5 py-0.5 rounded text-foreground">chrome://extensions</code> in Chrome</li>
            <li>Enable <strong className="text-foreground">Developer mode</strong> (top-right toggle)</li>
            <li>Click <strong className="text-foreground">Load unpacked</strong> and select the unzipped folder</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Index;
