$archivo = "jmeter\results\docker-stats-10-oficial.csv"; "Timestamp,Container,CPU_Percent,Memory_Usage" | Set-Content $archivo; while ($true) { $fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"; docker stats --no-stream --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}}" benchmarking-api benchmarking-postgres | ForEach-Object { "$fecha,$_" | Add-Content $archivo }; Start-Sleep -Seconds 1 }

docker run --rm -it --pid=host alpine:3.20 sh -c "apk add --no-cache htop && htop"

docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" benchmarking-api benchmarking-postgres
