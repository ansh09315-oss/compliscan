'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InspectionDossier, Inspector } from '@/types/metrology';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 8, color: '#666', letterSpacing: 2 },
  dossierCode: { fontSize: 14, fontWeight: 'bold', color: '#1D4ED8', marginTop: 8 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#0B2545', color: '#FFFFFF', padding: '4 8', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
  label: { color: '#64748B', fontSize: 9 },
  value: { fontWeight: 'bold', fontSize: 9 },
  certificate: { border: '2 solid #D4AF37', padding: 12, marginTop: 16, backgroundColor: '#FAFAF5' },
  certTitle: { fontSize: 10, fontWeight: 'bold', color: '#D4AF37', marginBottom: 6 },
  certText: { fontSize: 8, color: '#444', lineHeight: 1.5 },
  verdictBox: { padding: 12, textAlign: 'center', marginTop: 12, borderRadius: 4 },
  verdictScore: { fontSize: 28, fontWeight: 'bold' },
  verdictLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
});

interface InspectionPdfDocumentProps {
  dossier: InspectionDossier;
  inspector: Inspector;
}

export default function InspectionPdfDocument({ dossier, inspector }: InspectionPdfDocumentProps) {
  const verdictColor = dossier.verdict === 'COMPLIANT' ? '#16A34A' :
    dossier.verdict === 'NON_COMPLIANT' ? '#DC2626' :
    dossier.verdict === 'PARTIALLY_COMPLIANT' ? '#F59E0B' : '#1D4ED8';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>GOVERNMENT OF INDIA</Text>
          <Text style={styles.title}>LEGAL METROLOGY INSPECTION REPORT</Text>
          <Text style={styles.subtitle}>DEPARTMENT OF CONSUMER AFFAIRS</Text>
          <Text style={styles.dossierCode}>{dossier.dossierReferenceCode}</Text>
        </View>

        {/* Inspector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSPECTOR DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{inspector.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Badge #</Text>
            <Text style={styles.value}>{inspector.badgeNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>District</Text>
            <Text style={styles.value}>{inspector.assignedDistrict}</Text>
          </View>
        </View>

        {/* Product */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRODUCT DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Product Name</Text>
            <Text style={styles.value}>{dossier.productName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Brand</Text>
            <Text style={styles.value}>{dossier.brandName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Net Quantity</Text>
            <Text style={styles.value}>{dossier.declaredNetQuantity} {dossier.declaredNetUnit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>MRP</Text>
            <Text style={styles.value}>₹{dossier.declaredMrp}</Text>
          </View>
        </View>

        {/* Verdict */}
        <View style={[styles.verdictBox, { backgroundColor: verdictColor + '15' }]}>
          <Text style={[styles.verdictScore, { color: verdictColor }]}>{dossier.complianceScore}%</Text>
          <Text style={[styles.verdictLabel, { color: verdictColor }]}>
            {dossier.verdict.replace(/_/g, ' ')}
          </Text>
        </View>

        {/* Violations */}
        {dossier.violations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VIOLATIONS ({dossier.violations.length})</Text>
            {dossier.violations.map((v, i) => (
              <View key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{v.violationTitle}</Text>
                <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                  {v.statutoryRuleRef} • {v.severity}
                </Text>
                <Text style={{ fontSize: 8, color: '#444', marginTop: 2 }}>{v.defectDescription}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Section 63 Certificate */}
        <View style={styles.certificate}>
          <Text style={styles.certTitle}>
            SECTION 63 — BHARATIYA SAKSHYA ADHINIYAM, 2023
          </Text>
          <Text style={styles.certText}>
            Part A: This electronic record was produced by CompliScan AI (v1.0.0) on device {dossier.deviceHardwareId} at {dossier.inspectionTimestamp}.
          </Text>
          <Text style={[styles.certText, { marginTop: 4 }]}>
            Part B: Verified by Inspector {inspector.fullName} (Badge #{inspector.badgeNumber}).
          </Text>
          <Text style={[styles.certText, { marginTop: 4, fontFamily: 'Courier' }]}>
            SHA-256: {dossier.masterSha256Hash}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
