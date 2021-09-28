import type {
    ProjectExportRequest,
    ProjectExportResponse,
    ProjectImportFile,
    ProjectImportFileListResponse,
    ProjectImportPreviewRequest,
    ProjectImportPreviewResponse,
    ProjectImportRequest,
    ProjectImportResponse,
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class ImportExportActions {
    protected client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    export(exportRequest: ProjectExportRequest): Promise<ProjectExportResponse> {
        return this.client.post(this.client.getLink("ExportProjects"), exportRequest);
    }

    files(): Promise<ProjectImportFileListResponse> {
        return this.client.get(this.client.getLink("ProjectImportFiles"));
    }

    import(importRequest: ProjectImportRequest): Promise<ProjectImportResponse> {
        return this.client.post(this.client.getLink("ImportProjects"), importRequest);
    }

    preview(importRequest: ProjectImportPreviewRequest): Promise<ProjectImportPreviewResponse> {
        return this.client.post(this.client.getLink("ProjectImportPreview"), importRequest);
    }

    upload(pkg: File): Promise<ProjectImportFile> {
        const fd = new FormData();
        fd.append("fileToUpload", pkg);
        return this.client.post<ProjectImportFile>(this.client.getLink("ProjectImportFiles"), fd);
    }
}