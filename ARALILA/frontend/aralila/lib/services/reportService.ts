import api from '../api';

export interface Report {
    id: number;
    user_email: string;
    title: string;
    description: string;
    screenshot?: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    created_at: string;
    updated_at: string;
}

export const reportService = {
    getReports: async () => {
        const response = await api.get<Report[]>('reports/');
        return response.data;
    },

    createReport: async (data: { title: string; description: string; screenshot?: File }) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        if (data.screenshot) {
            formData.append('screenshot', data.screenshot);
        }

        const response = await api.post<Report>('reports/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateReportStatus: async (id: number, status: string) => {
        const response = await api.patch<Report>(`reports/${id}/`, { status });
        return response.data;
    }
};
