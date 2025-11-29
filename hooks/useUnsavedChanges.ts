
import { useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

/**
 * Hook para prevenir el cierre, recarga de página o navegación interna
 * si existen cambios no guardados.
 * 
 * @param isDirty - Booleano que indica si hay cambios sin guardar en el componente actual.
 */
export const useUnsavedChanges = (isDirty: boolean) => {
  const { setIsDirty } = useNavigation();

  // Sincronizar estado local con el contexto global de navegación
  useEffect(() => {
    setIsDirty(isDirty);
    
    // Limpieza al desmontar: aseguramos que no quede bloqueado
    return () => {
        setIsDirty(false);
    };
  }, [isDirty, setIsDirty]);

  // Manejo del evento nativo del navegador (Recargar/Cerrar pestaña)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
};
