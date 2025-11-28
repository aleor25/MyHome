import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

export const PropietarioDashboardScreen = () => {
  const [dashboard, setDashboard] = React.useState<any>(null);
  const [ingresosPorMes, setIngresosPorMes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, ingresosRes] = await Promise.all([
        api.get('/estadisticas/dashboard'),
        api.get('/estadisticas/ingresos-por-mes'),
      ]);

      setDashboard(dashboardRes.data);
      setIngresosPorMes(ingresosRes.data.ingresos || []);
    } catch (error: any) {
      console.error('Error al obtener dashboard:', error);
      Alert.alert('Error', 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se pudo cargar los datos</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Resumen General</Text>

        <View style={styles.cardRow}>
          <View style={[styles.card, styles.cardGreen]}>
            <Text style={styles.cardLabel}>Ingresos Totales</Text>
            <Text style={styles.cardValue}>
              ${dashboard.ingresos?.ingresosTotales || 0}
            </Text>
            <Text style={styles.cardSubtext}>
              {dashboard.ingresos?.totalReservas || 0} reservas
            </Text>
          </View>

          <View style={[styles.card, styles.cardBlue]}>
            <Text style={styles.cardLabel}>Este Mes</Text>
            <Text style={styles.cardValue}>
              ${dashboard.ingresosMes?.ingresosMes || 0}
            </Text>
            <Text style={styles.cardSubtext}>
              {dashboard.ingresosMes?.reservasMes || 0} reservas
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Ocupación</Text>
        <View style={styles.card}>
          <View style={styles.occupationContainer}>
            <View style={styles.occupationLeft}>
              <Text style={styles.occupationLabel}>Tasa de Ocupación</Text>
              <Text style={styles.occupationPercentage}>
                {dashboard.ocupacion?.tasaOcupacion || 0}%
              </Text>
            </View>
            <View style={styles.occupationRight}>
              <Text style={styles.occupationInfo}>
                {dashboard.ocupacion?.ocupadasAhora || 0} de{' '}
                {dashboard.ocupacion?.totalPropiedades || 0}
              </Text>
              <Text style={styles.occupationInfoSmall}>propiedades ocupadas</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Tendencias</Text>
        <View style={styles.card}>
          <View style={styles.trendContainer}>
            <View>
              <Text style={styles.trendLabel}>Cambio vs mes anterior</Text>
              <Text style={styles.trendValue}>
                {dashboard.tendencias?.porcentajeCambio > 0 ? '+' : ''}
                {dashboard.tendencias?.porcentajeCambio}%
              </Text>
            </View>
            <Text style={styles.trendEmoji}>
              {dashboard.tendencias?.tendencia}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Propiedad Más Popular</Text>
        {dashboard.propiedadPopular ? (
          <View style={styles.card}>
            <Text style={styles.propertyName}>
              {dashboard.propiedadPopular.nombre}
            </Text>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyInfoText}>
                📅 {dashboard.propiedadPopular.totalReservas} reservas
              </Text>
              <Text style={styles.propertyInfoText}>
                💰 ${dashboard.propiedadPopular.precioPromedio} promedio
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.noDataText}>Sin propiedades aún</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❌ Cancelaciones</Text>
        <View style={styles.cardRow}>
          <View style={[styles.card, styles.cardRed]}>
            <Text style={styles.cardLabel}>Total</Text>
            <Text style={styles.cardValue}>
              {dashboard.cancelaciones?.totalCancelaciones || 0}
            </Text>
          </View>

          <View style={[styles.card, styles.cardOrange]}>
            <Text style={styles.cardLabel}>Penalizaciones</Text>
            <Text style={styles.cardValue}>
              ${dashboard.cancelaciones?.penalizacionesTotales || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Gráfico de ingresos mensuales */}
      {ingresosPorMes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Ingresos por Mes</Text>
          <View style={styles.card}>
            <View style={styles.chartContainer}>
              {ingresosPorMes.slice(-6).map((item, index) => {
                const maxIngreso = Math.max(...ingresosPorMes.slice(-6).map(i => parseFloat(i.ingresos_totales)));
                const heightPercentage = maxIngreso > 0
                  ? (parseFloat(item.ingresos_totales) / maxIngreso) * 100
                  : 0;
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthName = monthNames[parseInt(item.mes) - 1];

                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          { height: `${Math.max(heightPercentage, 5)}%` }
                        ]}
                      >
                        <Text style={styles.barValue}>${item.ingresos_totales}</Text>
                      </View>
                    </View>
                    <Text style={styles.barLabel}>{monthName}</Text>
                    <Text style={styles.barSubLabel}>{item.reservas} res</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchDashboard}>
        <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
      </TouchableOpacity>

      <View style={styles.spacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  cardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  cardRed: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  cardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: colors.textLight,
  },
  occupationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occupationLeft: {
    flex: 1,
  },
  occupationRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  occupationLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  occupationPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  occupationInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  occupationInfoSmall: {
    fontSize: 12,
    color: colors.textLight,
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  trendValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  trendEmoji: {
    fontSize: 32,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  propertyInfo: {
    gap: 8,
  },
  propertyInfoText: {
    fontSize: 14,
    color: colors.textLight,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacing: {
    height: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 10,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
  },
  bar: {
    width: 40,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 5,
  },
  barValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    marginTop: 5,
  },
  barSubLabel: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 2,
  },
});