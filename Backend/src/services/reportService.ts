import Doc from '../models/Document';
import Extraction from '../models/Extraction';
import Workspace from '../models/Workspace';
import User from '../models/User';

export interface SystemReportData {
  generatedAt: Date;
  summary: {
    totalDocuments: number;
    totalExtractions: number;
    totalWorkspaces: number;
    totalUsers: number;
  };
  documentMetrics: {
    byStatus: Record<string, number>;
    riskDistribution: {
      low: number;
      moderate: number;
      high: number;
      critical: number;
    };
  };
  extractionMetrics: {
    byType: Record<string, number>;
  };
  signatureMetrics: {
    totalSigneesRequested: number;
    totalSigned: number;
    totalPending: number;
    completionRatePercentage: number;
  };
}

export class ReportService {
  /**
   * Generates real system metrics report aggregated directly from Mongoose models.
   */
  public static async generateReport(workspaceId?: string): Promise<SystemReportData> {
    const docFilter: any = {};
    const extractionFilter: any = {};

    if (workspaceId) {
      docFilter.workspace = workspaceId;
      extractionFilter.workspace = workspaceId;
    }

    // 1. Fetch counts
    const [totalDocs, totalExtractions, totalWorkspaces, totalUsers] = await Promise.all([
      Doc.countDocuments(docFilter),
      Extraction.countDocuments(extractionFilter),
      Workspace.countDocuments(),
      User.countDocuments(),
    ]);

    // 2. Fetch all documents for aggregated metrics
    const docs = await Doc.find(docFilter);

    const statusCounts: Record<string, number> = {
      uploaded: 0,
      scanning: 0,
      completed: 0,
      failed: 0,
    };

    const riskDistribution = {
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    };

    let totalSigneesRequested = 0;
    let totalSigned = 0;

    for (const doc of docs) {
      statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1;

      // Risk score aggregation
      if (doc.contractAnalysis && typeof doc.contractAnalysis.overallRisk === 'number') {
        const r = doc.contractAnalysis.overallRisk;
        if (r <= 40) riskDistribution.low++;
        else if (r <= 70) riskDistribution.moderate++;
        else if (r <= 85) riskDistribution.high++;
        else riskDistribution.critical++;
      }

      // Signees aggregation
      if (Array.isArray(doc.signees)) {
        totalSigneesRequested += doc.signees.length;
        totalSigned += doc.signees.filter((s) => s.signed).length;
      }
    }

    // 3. Fetch Extractions by document type
    const extractions = await Extraction.find(extractionFilter);
    const extractionByType: Record<string, number> = {
      invoice: 0,
      pan: 0,
      aadhaar: 0,
      gst: 0,
    };

    for (const ext of extractions) {
      extractionByType[ext.documentType] = (extractionByType[ext.documentType] || 0) + 1;
    }

    const totalPending = Math.max(0, totalSigneesRequested - totalSigned);
    const completionRatePercentage = totalSigneesRequested > 0
      ? Math.round((totalSigned / totalSigneesRequested) * 100)
      : 0;

    return {
      generatedAt: new Date(),
      summary: {
        totalDocuments: totalDocs,
        totalExtractions,
        totalWorkspaces,
        totalUsers,
      },
      documentMetrics: {
        byStatus: statusCounts,
        riskDistribution,
      },
      extractionMetrics: {
        byType: extractionByType,
      },
      signatureMetrics: {
        totalSigneesRequested,
        totalSigned,
        totalPending,
        completionRatePercentage,
      },
    };
  }
}

export default ReportService;
