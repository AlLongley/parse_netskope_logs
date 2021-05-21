import { useFilePicker } from "use-file-picker";
import React from "react";

export default function App(props) {
  //console.dir(props);
  const [files, errors, openFileSelector] = useFilePicker({
    multiple: false,
    accept: ".log"
  });

  if (errors.length > 0) return <p>Error!</p>;

  return (
    <div>
      <div
        style={{ width: 200, height: 20, background: "#1E90FF" }}
        onClick={() => openFileSelector()}
      >
        Load nsdebuglog.log here
      </div>
      <pre>{parse_content(files[0])}</pre>
    </div>
  );
}

export function parse_content(file) {
  if (file) {
    var content = file["content"];
    var lines = content.split("\r\n");
    var tunneled_logs = [];
    var bypassed_logs = [];

    lines.map((l) => {
      if (l.includes("nsTunnel")) {
        tunneled_logs.push(l);
      } else if (l.includes("BypassAppMgr")) {
        bypassed_logs.push(l);
      }
    });

    var tunneled_proc_hosts = {};
    var RE_proc = new RegExp("process: [^s]*.exe");
    var RE_host = new RegExp("host: (.*),");

    tunneled_logs.map((tl) => {
      if (tl.includes("host: ") && tl.includes("process: ")) {
        var tunnelled_process = RE_proc.exec(tl);
        var tunnelled_host = RE_host.exec(tl);

        if (tunnelled_process && tunnelled_host) {
          if (!(tunnelled_process in tunneled_proc_hosts)) {
            tunneled_proc_hosts[tunnelled_process] = [];
          }
          tunneled_proc_hosts[tunnelled_process].push(tunnelled_host[1]);
        }
      }
    });

    var results = [<h1> All tunneled domains listed by process </h1>];

    for (const [proc, hosts] of Object.entries(tunneled_proc_hosts)) {
      results.push(<h2> {proc} </h2>);

      hosts = hosts.filter(function (value, index, array) {
        return hosts.indexOf(value) == index;
      });

      hosts.forEach((h) => {
        results.push(<p>{h}</p>);
      });
    }
    return results;
  }
}
