export const handler = async (event) => {
  // Campos alineados con lo que el store y el template esperan:
  // id, name, license_plate, capacity, active
  const vehicles = [
    { id: 1, name: 'Camión A - Grande',    license_plate: 'ABC-123', capacity: 500, active: true },
    { id: 2, name: 'Camión B - Mediano',   license_plate: 'DEF-456', capacity: 300, active: true },
    { id: 3, name: 'Furgoneta C - Pequeña',license_plate: 'GHI-789', capacity: 100, active: true },
  ]

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, vehicles }),
  }
}
